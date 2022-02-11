include SequelHelper

class AddIsAutoIncrementToPowerbaseFields < ActiveRecord::Migration[6.1]
  def up
    add_column :powerbase_fields, :is_auto_increment, :boolean, :default => false, :null => false

    tables = PowerbaseTable.all
    tables.each do |table|
      schema = sequel_connect(table.db) {|db| db.schema(table.name.to_sym)}

      schema.each do |field_name, field_options|
        field = PowerbaseField.find_by(powerbase_table_id: table.id, name: field_name.to_s)
        next if !field
        field.is_auto_increment = field_options[:auto_increment] || false
        field.save
      end
    end
  end

  def down
    remove_column :powerbase_fields, :is_auto_increment, :boolean, :default => false, :null => false
  end
end
