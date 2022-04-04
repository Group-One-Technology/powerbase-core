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
end
