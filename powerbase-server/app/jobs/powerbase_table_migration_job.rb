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

          existing_column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
            .where("? LIKE CONCAT('%', db_type, '%')", "%#{column_options[:db_type]}%")
            .take

          column_type =  existing_column_type ? existing_column_type.powerbase_field_type.name : 'Others'
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
          field.save
        end
      end
    end

    total_saved_tables = PowerbaseTable.where(powerbase_database_id: database_id).count

    if db.tables.length === total_saved_tables
      database = PowerbaseDatabase.joins(:powerbase_fields).find(database_id)
      database.update(is_migrated: true)
    end
  end
end
