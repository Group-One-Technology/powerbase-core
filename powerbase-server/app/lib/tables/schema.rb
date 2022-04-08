include SequelHelper

class Tables::Schema
  attr_accessor :table, :database

  def initialize(table)
    @table = table
    @database = @table.db
  end

  def add_column(field_name, data_type)
    sequel_connect(database) do |db|
      db.alter_table(table.name.to_sym) { add_column(field_name.to_sym, data_type) }
    end
  end

  def drop_column(field)
    sequel_connect(database) do |db|
      db.alter_table(table.name.to_sym) { drop_column(field.name.to_sym) }

      if field.powerbase_field_type.data_type == "enums"
        db.drop_enum(field.db_type.to_sym)
      end
    end
  end

  # Only available for PostgreSQL databases.
  def create_enum(data_type, enum_values)
    sequel_connect(database) do |db|
      db.create_enum(data_type.to_sym, enum_values.uniq)
    end
  end
end
