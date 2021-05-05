class PowerbaseTableMigrationJob < ApplicationJob
  queue_as :default

  def perform(database_id, connection_string)
    db = Powerbase.connect({ connection_string: connection_string })
    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    if !single_line_text_field
      raise StandardError.new("There is no 'single line text' field in the database.")
    end

    db.tables.each do |table_name|
      table = PowerbaseTable.find_by(name: table_name) || PowerbaseTable.new
      table.name = table_name
      table.powerbase_database_id = database_id

      if table.save
        db.schema(table_name.to_sym).each_with_index do |column, index|
          column_name = column[0]
          column_options = column[1]

          column_type = if column_options[:db_type] === "integer" || column_options[:db_type] === "float" || column_options[:db_type] === "bigint"
              "Number"
            elsif column_options[:db_type] === "text" || column_options[:db_type] === "character varying" || column_options[:db_type].include?("varchar")
              "Single Line Text"
            elsif column_options[:db_type] === "date" || column_options[:db_type].include?("timestamp")
              "Date"
            elsif column_options[:db_type] === "boolean"
              "Checkbox"
            else
              column_options[:db_type].capitalize
          end

          field_type = PowerbaseFieldType.find_by(name: column_type)

          field = PowerbaseField.find_by(name: column_name) || PowerbaseField.new
          field.name = column_name
          field.oid = column_options[:oid]
          field.db_type = column_options[:db_type]
          field.default_value = column_options[:default] || nil
          field.is_primary_key = column_options[:primary_key]
          field.is_foreign_key = false # TODO: Add foreign key constraints
          field.is_nullable = column_options[:allow_null]
          field.order = index + 1
          field.powerbase_table_id = table.id
          field.powerbase_field_type_id = field_type ? field_type.id : single_line_text_field.id
          if !field.save
            puts field.errors.messages
          end
        end

        total_saved_fields = PowerbaseField.where(powerbase_table_id: table.id).count

        if db.schema(table_name.to_sym).length === total_saved_fields
          database = PowerbaseDatabase.find(database_id)
          database.update(is_migrated: true)
        end
      end
    end
  end
end
