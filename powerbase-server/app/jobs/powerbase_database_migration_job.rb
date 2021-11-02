class PowerbaseDatabaseMigrationJob < ApplicationJob
  queue_as :default

  DEFAULT_PAGE_SIZE = 40
  DEFAULT_PAGE_SIZE_TURBO = 200

  # * Migrates the given remote database.
  def perform(database_id)
    @database = PowerbaseDatabase.find(database_id);
    @base_migration = BaseMigration.find_by(powerbase_database_id: database_id)

    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    @base_migration.logs["errors"] = [] if !@base_migration.logs["errors"]

    if !single_line_text_field
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "There is no 'single line text' field in the database.",
      })
      @base_migration.save
      return
    elsif !@database
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "Database with id of #{database_id} could not be found.",
      })
      @base_migration.save
      return
    elsif @database.is_migrated
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "Database with id of #{database_id} has already been migrated.",
      })
      @base_migration.save
      return
    end

    if !@base_migration
      @base_migration = BaseMigration.new
      @base_migration.powerbase_database_id = @database.id

      case @database.adapter
      when "postgresql"
        @db_size = connect(@database) {|db|
          db.select(Sequel.lit('pg_size_pretty(pg_database_size(current_database())) AS size'))
            .first[:size]
        }
      when "mysql2"
        @db_size = connect(@database) {|db|
          db.from(Sequel.lit("information_schema.TABLES"))
          .select(Sequel.lit("concat(sum(data_length + index_length) / 1024, \" kB\") as size"))
          .where(Sequel.lit("ENGINE=('MyISAM' || 'InnoDB' ) AND table_schema = ?", @database.database_name))
          .group(:table_schema)
          .first[:size]
        }
      end

      @base_migration.retries = 0
      @base_migration.database_size = @db_size || "0 kB"
      @base_migration.save
    end

    if @base_migration.start_time
      @base_migration.retries += 1
    else
      @base_migration.start_time = Time.now
    end

    @base_migration.save

    # Table Migration
    puts "#{@base_migration.start_time} Migrating tables of database with id of #{@database.id}..."

    connect(@database) {|db|
      db.tables.each_with_index do |table_name, index|
        table = PowerbaseTable.find_by(
          name: table_name,
          powerbase_database_id: @database.id,
        ) || PowerbaseTable.new
        table.name = table_name
        table.alias = table_name.to_s.titlecase
        table.powerbase_database_id = @database.id
        table.page_size = @database.is_turbo ? DEFAULT_PAGE_SIZE_TURBO : DEFAULT_PAGE_SIZE
        table.order = index
        if !table.save
          @base_migration.logs["errors"].push({
            type: "Active Record",
            error: "Failed to save '#{table_name}' table",
            messages: table.errors.messages,
          })
          @base_migration.save
        end
      end
    }

    @database_tables = PowerbaseTable.where(powerbase_database_id: @database.id)

    @database_tables.each do |table|
      next if table.is_migrated

      # Table Fields Migration
      puts "#{Time.now} Migrating tables fields of table with id of #{table.id}..."

      connect(@database) {|db|
        db.extension :pg_enum if @database.adapter == "postgresql"
        db.schema(table.name.to_sym).each do |column|
          column_name = column[0]
          column_options = column[1]

          field = PowerbaseField.find_by(
            name: column_name,
            powerbase_table_id: table.id,
          ) || PowerbaseField.new
          field.name = column_name
          field.alias = column_name.to_s.titlecase
          field.oid = column_options[:oid]
          field.db_type = column_options[:db_type]
          field.default_value = column_options[:default] || nil
          field.is_primary_key = column_options[:primary_key]
          field.is_nullable = column_options[:allow_null]
          field.is_pii = Pii.is_pii?(column_name)
          field.powerbase_table_id = table.id

          column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
            .where("? ILIKE CONCAT('%', db_type, '%')", "%#{column_options[:db_type]}%")
            .take

          field_type = PowerbaseFieldType.find_by(
            name: column_type ? column_type.powerbase_field_type.name : "Others"
          ).id || single_line_text_field.id
          field.powerbase_field_type_id = field_type

          if field.save
            if column_type&.db_type === "enum"
              # Field Select Options / Enums Migration
              field_select_options = FieldSelectOption.find_by(
                name: column_options[:db_type],
                powerbase_field_id: field.id,
              ) || FieldSelectOption.new
              field_select_options.name = column_options[:db_type]

              if @database.adapter === "postgresql"
                field_select_options.values = column_options[:enum_values]
              elsif @database.adapter === "mysql2"
                field_select_options.values = column_options[:db_type].slice(5..-2)
                  .tr("''", "")
                  .split(",")
              end

              field_select_options.powerbase_field_id = field.id
              if !field_select_options.save
                @base_migration.logs["errors"].push({
                  type: "Active Record",
                  error: "Failed to save '#{field_select_options.name}' enums",
                  messages: field_select_options.errors.messages,
                })
                @base_migration.save
              end
            end
          else
            @base_migration.logs["errors"].push({
              type: "Active Record",
              error: "Failed to save '#{column_name}' field",
              messages: field.errors.messages,
            })
            @base_migration.save
          end
        end
      }

      # Table View and View Fields Migration
      puts "#{Time.now} Migrating table view and view fields of table with id of #{table.id}..."
      table_view = TableView.find_by(powerbase_table_id: table.id) || TableView.new
      table_view.powerbase_table_id = table.id
      table_view.name = "Default"
      table_view.view_type = "grid"
      table_view.order = 0
      if table_view.save
        table.default_view_id = table_view.id
        table.save

        fields = PowerbaseField.where(powerbase_table_id: table.id)
        fields.each_with_index do |cur_field, index|
          view_field = ViewFieldOption.find_by(
            table_view_id: table_view.id,
            powerbase_field_id: cur_field.id,
          ) || ViewFieldOption.new
          view_field.width = case cur_field.powerbase_field_type_id
            when 3
              cur_field.name.length > 4 ? cur_field.name.length * 20 : 100
            else
              300
            end
          view_field.order = index + 1
          view_field.table_view_id = table_view.id
          view_field.powerbase_field_id = cur_field.id
          if !view_field.save
            @base_migration.logs["errors"].push({
              type: "Active Record",
              error: "Failed to save '#{cur_field.name}' view field for #{table_view.name} view",
              messages: field.errors.messages,
            })
            @base_migration.save
          end
        end
      else
        @base_migration.logs["errors"].push({
          type: "Active Record",
          error: "Failed to save '#{table_view.name}' view",
          messages: table_view.errors.messages,
        })
        @base_migration.save
      end

      # Base Connection Migration
      puts "#{Time.now} Migrating foreign keys of table with id of #{table.id}..."
      connect(@database) {|db|
        table_foreign_keys = db.foreign_key_list(table.name)
        table_foreign_keys.each do |foreign_key|
          referenced_table = @database_tables
            .select { |item| item.name == foreign_key[:table].to_s }
            .first

          if referenced_table
            base_connection = BaseConnection.find_by(
              name: foreign_key[:name],
              powerbase_table_id: table.id,
              powerbase_database_id: table.powerbase_database_id,
            ) || BaseConnection.new
            base_connection.name = foreign_key[:name]
            base_connection.columns = foreign_key[:columns]
            base_connection.referenced_columns = foreign_key[:key]
            base_connection.referenced_table_id = referenced_table.id
            base_connection.referenced_database_id = referenced_table.powerbase_database_id
            base_connection.powerbase_table_id = table.id
            base_connection.powerbase_database_id = table.powerbase_database_id

            if !base_connection.save
              @base_migration.logs["errors"].push({
                type: "Active Record",
                error: "Failed to save '#{base_connection.name}' base connection",
                messages: base_connection.errors.messages,
              })
              @base_migration.save
            end
          end
        end
      }
    end

    @field_primary_keys = PowerbaseField.where(
      powerbase_table_id: @database_tables.map {|item| item.id},
      is_primary_key: true,
    )

    @database_tables.each do |table|
      # Scan for possible base connections migration
      puts "#{Time.now} Scanning and migrating possible base connections for table with id of #{table.id}..."
      table.powerbase_fields.each do |field|
        if field.name.downcase.end_with? "id"
          referenced_table = field.name.downcase.delete_suffix("id")
          referenced_table = referenced_table.delete_suffix("_") if referenced_table.end_with? "_"
          referenced_table = referenced_table.gsub("_","")

          is_singular = referenced_table.pluralize != referenced_table && referenced_table.singularize == referenced_table

          referenced_table = @database_tables.find do |item|
            table_name = item.name.downcase.gsub("_","")

            table_name == referenced_table ||
              (is_singular && table_name == referenced_table.pluralize) ||
              (!is_singular && table_name == referenced_table.singularize)
          end

          if referenced_table && referenced_table.id != table.id
            base_connection = BaseConnection.find_by(
              columns: [field.name],
              powerbase_table_id: table.id,
              powerbase_database_id: table.powerbase_database_id,
              referenced_table_id: referenced_table.id,
              referenced_database_id: referenced_table.powerbase_database_id,
            )

            if !base_connection
              referenced_table_column = @field_primary_keys.find {|item| item.powerbase_table_id == referenced_table.id}

              base_connection = BaseConnection.new
              base_connection.name = "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{field.name}"
              base_connection.columns = [field.name]
              base_connection.referenced_columns = [referenced_table_column.name]
              base_connection.referenced_table_id = referenced_table.id
              base_connection.referenced_database_id = referenced_table.powerbase_database_id
              base_connection.powerbase_table_id = table.id
              base_connection.powerbase_database_id = table.powerbase_database_id
              base_connection.is_auto_linked = true

              if !base_connection.save
                @base_migration.logs["errors"].push({
                  type: "Active Record",
                  error: "Failed to save '#{base_connection.name}' base connection",
                  messages: base_connection.errors.messages,
                })
                @base_migration.save
              end
            end
          end
        else
          referenced_column = @field_primary_keys.find {|item| item.name == field.name}
          other_referenced_columns = referenced_column && @field_primary_keys.select {|item|
            item.id != referenced_column.id && item.powerbase_table_id == referenced_column.powerbase_table_id
          }

          if referenced_column && other_referenced_columns.length == 0 && referenced_column.powerbase_table_id != field.powerbase_table_id
            referenced_table = referenced_column.powerbase_table

            base_connection = BaseConnection.find_by(
              columns: [field.name],
              powerbase_table_id: table.id,
              powerbase_database_id: table.powerbase_database_id,
              referenced_table_id: referenced_table.id,
              referenced_database_id: referenced_table.powerbase_database_id,
            )

            if !base_connection
              base_connection = BaseConnection.new
              base_connection.name = "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{field.name}"
              base_connection.columns = [field.name]
              base_connection.referenced_columns = [referenced_column.name]
              base_connection.referenced_table_id = referenced_table.id
              base_connection.referenced_database_id = referenced_table.powerbase_database_id
              base_connection.powerbase_table_id = table.id
              base_connection.powerbase_database_id = table.powerbase_database_id
              base_connection.is_auto_linked = true

              if !base_connection.save
                @base_migration.logs["errors"].push({
                  type: "Active Record",
                  error: "Failed to save '#{base_connection.name}' base connection",
                  messages: base_connection.errors.messages,
                })
                @base_migration.save
              end
            end
          end
        end
      end

      if !@database.is_turbo
        table.is_migrated = true
        table.save
      end
    end

    if @database.is_turbo
      notifier = Powerbase::Notifier.new @database

      notifier.create_notifier!

      @database_tables.each do |table|
        # Table Records Migration
        if !table.is_migrated
                    
          # Add OID Column
          notifier.add_oid!(table.name) if @database.has_row_oid_support?

          # Inject notifier trigger
          notifier.add_trigger(table.name)

          table_model = Powerbase::Model.new(ElasticsearchClient, table.id)
          table_model.index_records

          table.is_migrated = true
          table.save
        end
      end

      # Include new db to poller & start listening
      poller = Sidekiq::Cron::Job.find("Database Listeners")
      poller.args << @database.id
      poller.save
      poller.enque!
    end

    unmigrated_tables = PowerbaseTable.where(powerbase_database_id: @database.id, is_migrated: false)

    if unmigrated_tables.length > 0
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "Some tables hasn't finished migrating yet.",
      })
      @base_migration.save
    end

    @database.update(is_migrated: true)
    @base_migration.end_time = Time.now
    @base_migration.save
  end

  private
    def connect(db, &block)
      Powerbase.connect({
        adapter: db.adapter,
        connection_string: db.connection_string,
        is_turbo: db.is_turbo,
      }, &block)
    end
end