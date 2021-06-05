class PowerbaseDatabaseMigrationJob < ApplicationJob
  queue_as :default

  # { database_id, adapter, connection_string, is_turbo }
  def perform(options)
    # Database Connection
    db = Powerbase.connect({
      adapter: options[:adapter],
      connection_string: options[:connection_string],
      is_turbo: options[:is_turbo],
    })
    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    if !single_line_text_field
      raise StandardError.new("There is no 'single line text' field in the database.")
    end

    total_saved_fields = 0

    db.tables.each do |table_name|
      # Table Migration
      table = PowerbaseTable.find_by(name: table_name, powerbase_database_id: options[:database_id]) || PowerbaseTable.new
      table.name = table_name
      table.powerbase_database_id = options[:database_id]

      if table.save
        db.schema(table_name.to_sym).each_with_index do |column, index|
          column_name = column[0]
          column_options = column[1]

          # Field Migration
          field = PowerbaseField.find_by(
            name: column_name,
            oid: column_options[:oid],
            powerbase_table_id: table.id,
          ) || PowerbaseField.new
          field.name = column_name
          field.oid = column_options[:oid]
          field.db_type = column_options[:db_type]
          field.default_value = column_options[:default] || nil
          field.is_primary_key = column_options[:primary_key]
          field.is_nullable = column_options[:allow_null]
          field.order = index + 1
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

              if options[:adapter] === "postgresql"
                field_select_options.values = column_options[:enum_values]
              elsif options[:adapter] === "mysql2"
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

        # Add default views
        table_view = TableView.new
        table_view.powerbase_table_id = table.id
        table_view.name = "Grid"
        table_view.view_type = "grid"
        if !table_view.save
          # TODO: Add error tracker (ex. Sentry)
          puts "Failed to save default grid view: #{table.name}"
          puts table_view.errors.messages
        end

        # Table Records Migration
        table_model = Powerbase::Model.new(table.id, table.name)
        table_model.index_records
      else
        # TODO: Add error tracker (ex. Sentry)
        puts "Failed to save table: #{table.name}"
        puts table.errors.messages
      end
    end

    db_tables = PowerbaseTable.where(powerbase_database_id: options[:database_id])

    db_tables.each do |table|
      # Foreign Keys Migration
      table_foreign_keys = db.foreign_key_list(table.name)
      table_foreign_keys.each do |foreign_key|
        referenced_table = db_tables.select { |item| item.name == foreign_key[:table].to_s }.first

        table_foreign_key = TableForeignKey.find_by(name: foreign_key[:name], powerbase_table_id: table.id) || TableForeignKey.new
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
    end

    if db.tables.length === db_tables.length
      database = PowerbaseDatabase.find(options[:database_id])

      if total_saved_fields === database.powerbase_fields.length
        database.update(is_migrated: true)
        Powerbase.disconnect
      else
        puts "Total fields are not equal. Expected: #{total_saved_fields}, Actual: #{database.powerbase_fields.length}"
      end
    else
      puts "Total tables are not equal. Expected: #{db.tables.length}, Actual: #{db_tables.length}"
    end
  end
end
