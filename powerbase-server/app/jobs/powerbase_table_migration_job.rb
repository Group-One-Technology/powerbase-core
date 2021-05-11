class PowerbaseTableMigrationJob < ApplicationJob
  queue_as :default

  def perform(database_id, adapter, connection_string)
    # Database Connection
    db = Powerbase.connect({ adapter: adapter, connection_string: connection_string })
    database = PowerbaseDatabase.includes(:powerbase_fields).find(database_id)
    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    if !single_line_text_field
      raise StandardError.new("There is no 'single line text' field in the database.")
    end

    total_saved_fields = 0

    db.tables.each do |table_name|
      # Table Migration
      table = PowerbaseTable.find_by(name: table_name) || PowerbaseTable.new
      table.name = table_name
      table.powerbase_database_id = database.id

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

              if database.adapter === "postgresql"
                field_select_options.values = column_options[:enum_values]
                puts column_options[:enum_values]
              elsif database.adapter === "mysql2"
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
      else
        # TODO: Add error tracker (ex. Sentry)
        puts "Failed to save table: #{table.name}"
        puts table.errors.messages
      end
    end

    db_tables = PowerbaseTable.where(powerbase_database_id: database.id)

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
      if total_saved_fields === database.powerbase_fields.length
        database.update(is_migrated: true)
      end
    end
  end
end
