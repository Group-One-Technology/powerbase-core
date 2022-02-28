class Fields::Schema
  include SequelHelper

  attr_accessor :field

  def initialize(field)
    @field = field
  end

  def set_nullable(is_nullable = true)
    table = @field.table
    table_name = table.name.to_sym
    field_name = @field.name.to_sym

    if !@field.is_virtual
      sequel_connect(@field.table.db) do |db|
        if is_nullable
          db.alter_table(table_name) { set_column_allow_null(field_name) }
        else
          db.alter_table(table_name) { set_column_not_null(field_name) }
        end
      end
    end

    @field.update(is_nullable: is_nullable)
  end
end