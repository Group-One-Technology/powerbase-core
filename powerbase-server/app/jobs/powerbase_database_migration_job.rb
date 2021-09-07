class PowerbaseDatabaseMigrationJob < ApplicationJob
  queue_as :default

  DEFAULT_PAGE_SIZE = 40
  DEFAULT_PAGE_SIZE_TURBO = 200

  # * Migrates the given remote database.
  def perform(database_id)
    @database = PowerbaseDatabase.find(database_id);

    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")
    total_saved_fields = 0
    total_tables = 0

    if !single_line_text_field
      puts "ERROR: There is no 'single line text' field in the database."
      return
    elsif !@database
      puts "ERROR: Database with id of #{database_id} could not be found."
      return
    end

    if @database.is_migrated
      puts "ERROR: Database with id of #{database_id} has already been migrated."
      return
    end

    # Table Migration
    puts "#{Time.now} Migrating tables of database with id of #{database_id}..."

    connect(@database) {|db|
      db.tables.each do |table_name|
        table = PowerbaseTable.find_by(
          name: table_name,
          powerbase_database_id: @database.id,
        ) || PowerbaseTable.new
        table.name = table_name
        table.powerbase_database_id = @database.id
        table.page_size = @database.is_turbo ? DEFAULT_PAGE_SIZE_TURBO : DEFAULT_PAGE_SIZE

        if !table.save
          # TODO: Add error tracker (ex. Sentry)
          puts "Failed to save table: #{table.name}"
          puts table.errors.messages
        end
      end

      total_tables = db.tables.length
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
          field.oid = column_options[:oid]
          field.db_type = column_options[:db_type]
          field.default_value = column_options[:default] || nil
          field.is_primary_key = column_options[:primary_key]
          field.is_nullable = column_options[:allow_null]
          field.powerbase_table_id = table.id

          column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
            .where("? LIKE CONCAT('%', db_type, '%')", "%#{column_options[:db_type]}%")
            .take

          field_type = PowerbaseFieldType.find_by(
            name: column_type ? column_type.powerbase_field_type.name : "Others"
          ).id || single_line_text_field.id
          field.powerbase_field_type_id = field_type

          if field.save
            total_saved_fields += 1

            if column_type.db_type === "enum"
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
                # TODO: Add error tracker (ex. Sentry)
                puts "Failed to save enums: #{field_select_options.name}"
                puts field_select_options.errors.messages
              end
            end
          else
            # TODO: Add error tracker (ex. Sentry)
            puts "Failed to save field: #{field.name}"
            puts field.errors.messages
          end
        end
      }

      # Table View and View Fields Migration
      puts "#{Time.now} Migrating table view and view fields of table with id of #{table.id}..."
      table_view = TableView.new
      table_view.powerbase_table_id = table.id
      table_view.name = "Grid View"
      table_view.view_type = "grid"
      if table_view.save
        table.default_view_id = table_view.id
        table.save

        fields = PowerbaseField.where(powerbase_table_id: table.id)
        fields.each_with_index do |cur_field, index|
          view_field = ViewFieldOption.new
          view_field.width = case cur_field.powerbase_field_type_id
            when 3
              cur_field.name.length > 4 ? cur_field.name.length * 20 : 100
            else
              300
            end
          view_field.order = index + 1
          view_field.table_view_id = table_view.id
          view_field.powerbase_field_id = cur_field.id
          view_field.save
        end
      else
        # TODO: Add error tracker (ex. Sentry)
        puts "Failed to save default grid view: #{table.name}"
        puts table_view.errors.messages
      end

      # Base Connection Migration
      puts "#{Time.now} Migrating foreign keys of table with id of #{table.id}..."
      connect(@database) {|db|
        table_foreign_keys = db.foreign_key_list(table.name)
        table_foreign_keys.each do |foreign_key|
          referenced_table = @database_tables
            .select { |item| item.name == foreign_key[:table].to_s }
            .first

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
            # TODO: Add error tracker (ex. Sentry)
            puts "Failed to save foreign key constraint: #{base_connection.name}"
            puts base_connection.errors.messages
          end
        end
      }

      # Scan for possible base connections migration
      puts "#{Time.now} Scanning and migrating possible base connections for table with id of #{table.id}..."
      foreign_key_fields = PowerbaseField.where(
        "powerbase_table_id = ? AND LOWER(name) like '%id' AND is_primary_key = FALSE",
        table.id,
      )

      foreign_key_fields.each do |field|
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

        if referenced_table
          base_connection = BaseConnection.find_by(
            columns: [field.name],
            powerbase_table_id: table.id,
            powerbase_database_id: table.powerbase_database_id,
            referenced_table_id: referenced_table.id,
            referenced_database_i: referenced_table.powerbase_database_id,
          )

          if !base_connection
            referenced_table_primary_keys = PowerbaseField.where(
              powerbase_table_id: referenced_table.id,
              is_primary_key: true,
            )

            base_connection = BaseConnection.new
            base_connection.name = "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{field.name}"
            base_connection.columns = [field.name]
            base_connection.referenced_columns = referenced_table_primary_keys.map {|key| key.name}
            base_connection.referenced_table_id = referenced_table.id
            base_connection.referenced_database_id = referenced_table.powerbase_database_id
            base_connection.powerbase_table_id = table.id
            base_connection.powerbase_database_id = table.powerbase_database_id

            if !base_connection.save
              # TODO: Add error tracker (ex. Sentry)
              puts "Failed to save foreign key constraint: #{base_connection.name}"
              puts base_connection.errors.messages
            end
          else
            # TODO: To remove (added for debugging purposes only)
            puts "Base Connection #{base_connection.id} already exists for columns of #{field.name} of table #{table.id}."
          end
        end
      end

      if !@database.is_turbo
        table.is_migrated = true
        table.save
      end
    end

    if @database.is_turbo
      @database_tables.each do |table|
        # Table Records Migration
        if !table.is_migrated
          table_model = Powerbase::Model.new(ElasticsearchClient, table.id)
          table_model.index_records

          table.is_migrated = true
          table.save
        end
      end
    end

    if total_tables === @database_tables.length
      if total_saved_fields === @database.powerbase_fields.length
        unmigrated_tables = PowerbaseTable.where(powerbase_database_id: @database.id, is_migrated: false)

        if unmigrated_tables.length == 0
          @database.update(is_migrated: true)
        else
          puts "Some tables hasn't finished migrating yet."
        end
      else
        puts "Total fields are not equal. Expected: #{total_saved_fields}, Actual: #{@database.powerbase_fields.length}"
      end
    end
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
