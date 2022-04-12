include SequelHelper

class Databases::Schema
  attr_accessor :database

  def initialize(database)
    @database = database
  end

  def create_table(table_params, fields)
    table_creator = Tables::Creator.new table_params[:name], database,
      order: database.tables.length + 1,
      table_alias: table_params[:alias],
      is_virtual: table_params[:is_virtual]
    table_creator.save
    table = table_creator.object

    fields.each_with_index do |field, index|
      is_virtual = table.is_virtual || field[:is_virtual]
      field_name = is_virtual ? field[:name].snakecase : field[:name]

      field_creator = Fields::Creator.new([field_name, {
        alias: field[:alias],
        allow_null: field[:is_nullable],
        is_pii: field[:is_pii],
        has_validation: field[:has_validation],
        field_type_id: field[:field_type_id],
        is_virtual: is_virtual,
        db_type: field[:db_type],
        primary_key: field[:is_primary_key],
        # * Select field types currently only supports postgresql hence the enum_values, mysql uses db_type for its option values.
        enum_values: field[:select_options],
        options: field[:options],
      }], table)
      field_creator.save
    end

    if !table.is_virtual
      actual_columns = fields.select {|field| !field[:is_virtual]}
        .map do |field|
          {
            name: field[:name],
            data_type: field[:db_type],
            enum_values: field[:select_options],
            primary_key: field[:is_primary_key],
            null: field[:is_nullable],
          }
        end

      primary_keys = actual_columns.select {|field| field[:primary_key]}
        .map {|field| field[:name].to_sym}

      begin
        sequel_connect(database) do |db|
          db.create_table(table.name.to_sym) do
            actual_columns.each do |field|
              if field[:data_type].end_with?("enum") || (field[:enum_values] && field[:enum_values].length > 0)
                db.create_enum(field[:data_type].to_sym, field[:enum_values].uniq)
              end

              column(field[:name].to_sym, field[:data_type], null: field[:null])
            end

            if primary_keys.length > 0
              primary_key(primary_keys)
            end
          end
        end
      rescue Sequel::DatabaseError => ex
        table.remove
        raise ex
      end
    end

    create_index!(table.index_name)
    table.write_migration_logs!(status: "migrated")
  end
end
