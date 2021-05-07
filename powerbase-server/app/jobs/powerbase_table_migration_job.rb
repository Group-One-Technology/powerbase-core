class PowerbaseTableMigrationJob < ApplicationJob
  queue_as :default

  def perform(database_id, connection_string)
    db = Powerbase.connect({ connection_string: connection_string })
    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    if !single_line_text_field
      raise StandardError.new("There is no 'single line text' field in the database.")
    end

    total_saved_fields = 0

    db.tables.each do |table_name|
      table = PowerbaseTable.find_by(name: table_name) || PowerbaseTable.new
      table.name = table_name
      table.powerbase_database_id = database_id

      if table.save
        table_foreign_keys = db.foreign_key_list(table_name.name)

        db.schema(table_name.to_sym).each_with_index do |column, index|
          column_name = column[0]
          column_options = column[1]

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

          field_foreign_key = table_foreign_keys.select { |fk_key| fk_key[:columns].include?(column_name) }.first
          field.is_foreign_key = field_foreign_key ? true : false
          if field_foreign_key
            field.join_table_name = field_foreign_key[:table]
            field.join_field_names = field_foreign_key[:key]
          end

          field.is_nullable = column_options[:allow_null]
          field.order = index + 1
          field.powerbase_table_id = table.id

          existing_column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
            .where("? LIKE CONCAT('%', db_type, '%')", "%#{column_options[:db_type]}%")
            .take

          column_type =  existing_column_type ? existing_column_type.powerbase_field_type.name : 'Others'
          field_type = PowerbaseFieldType.find_by(name: column_type).id || single_line_text_field.id
          field.powerbase_field_type_id = field_type

          if field.save
            total_saved_fields += 1
          else
            # TODO: Add error tracker (ex. Sentry)
            puts "Failed to save #{field.name}"
            puts field.errors.messages
          end
        end
      end
    end

    total_saved_tables = PowerbaseTable.where(powerbase_database_id: database_id).count


    if db.tables.length === total_saved_tables
      database = PowerbaseDatabase.includes(:powerbase_fields).find(database_id)

      if total_saved_fields === database.powerbase_fields.length
        database.update(is_migrated: true)
      end
    end
  end
end
