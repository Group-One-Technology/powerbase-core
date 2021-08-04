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
      raise StandardError.new("There is no 'single line text' field in the database.")
    elsif !@database
      raise StandardError.new("Database with id of #{database_id} could not be found.")
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
      # Table Fields Migration
      puts "#{Time.now} Migrating tables fields of table with id of #{table.id}..."

      connect(@database) {|db|
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

          existing_column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
            .where("? LIKE CONCAT('%', db_type, '%')", "%#{column_options[:db_type]}%")
            .take

          column_type =  existing_column_type ? existing_column_type.powerbase_field_type.name : "Others"
          field_type = PowerbaseFieldType.find_by(name: column_type).id || single_line_text_field.id
          field.powerbase_field_type_id = field_type

          if field.save
            total_saved_fields += 1

            if column_options[:type] === :enum
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

      # Foreign Keys Migration
      puts "#{Time.now} Migrating foreign keys of table with id of #{table.id}..."
      connect(@database) {|db|
        table_foreign_keys = db.foreign_key_list(table.name)
        table_foreign_keys.each do |foreign_key|
          referenced_table = @database_tables
            .select { |item| item.name == foreign_key[:table].to_s }
            .first

          table_foreign_key = TableForeignKey.find_by(
            name: foreign_key[:name],
            powerbase_table_id: table.id
          ) || TableForeignKey.new
          table_foreign_key.name = foreign_key[:name]
          table_foreign_key.columns = foreign_key[:columns]
          table_foreign_key.referenced_columns = foreign_key[:key]
          table_foreign_key.referenced_table_id = referenced_table.id
          table_foreign_key.powerbase_table_id = table.id

          if !table_foreign_key.save
            # TODO: Add error tracker (ex. Sentry)
            puts "Failed to save foreign key constraint: #{table_foreign_key.name}"
            puts table_foreign_key.errors.messages
          end
        end
      }

      if !@database.is_turbo
        table.is_migrated = true
        table.save
      end
    end

    if @database.is_turbo
      @database_tables.each do |table|
        # Table Records Migration
        table_model = Powerbase::Model.new(ElasticsearchClient, table.id)
        table_model.index_records

        table.is_migrated = true
        table.save
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
