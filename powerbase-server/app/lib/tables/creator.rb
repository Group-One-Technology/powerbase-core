class Tables::Creator
  include SequelHelper

  attr_accessor :table_name, :order, :database, :table

  def initialize(table_name, order, database)
    @table_name = table_name
    @order = order
    @database = database
    @base_migration = database.base_migration
    initialize_new_table!
  end

  def initialize_new_table!
    @table = PowerbaseTable.find_by(
      name: table_name,
      powerbase_database_id: @database.id,
    ) || PowerbaseTable.new
    table.name = table_name
    table.alias = table_name.to_s.titlecase
    table.powerbase_database_id = database.id
    table.page_size = database.is_turbo ? DEFAULT_PAGE_SIZE_TURBO : DEFAULT_PAGE_SIZE
    table.order = order
  end

  def object
    table
  end

  def save
    if table.save
      if database.postgresql?
        table.inject_oid if database.has_row_oid_support?
        table.inject_notifier_trigger
      end
    else
      base_migration.logs["errors"].push({
        type: "Active Record",
        error: "Failed to save '#{table_name}' table",
        messages: table.errors.messages,
      })
      base_migration.save
    end
  end

  def create_base_connection!
    sequel_connect(database) do |db|
      table_foreign_keys = db.foreign_key_list(table.name)
      table_foreign_keys.each do |foreign_key|
        referenced_table = database.tables.find_by(name: foreign_key[:table].to_s)

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
    end

    @field_primary_keys = table.primary_keys

    table.fields.each do |field|
      if field.name.downcase.end_with? "id"
        referenced_table = field.name.downcase.delete_suffix("id")
        referenced_table = referenced_table.delete_suffix("_") if referenced_table.end_with? "_"
        referenced_table = referenced_table.gsub("_","")

        is_singular = referenced_table.pluralize != referenced_table && referenced_table.singularize == referenced_table

        referenced_table = database.tables.find do |item|
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
            referenced_table_column = referenced_table.primary_keys.first

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
  end

  def sync!
    table.sync!
  end
end
