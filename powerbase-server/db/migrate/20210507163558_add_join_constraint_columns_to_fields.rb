class AddJoinConstraintColumnsToFields < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :join_field_names, :string, array: true, default: []
    add_column :powerbase_fields, :join_table_name, :string
  end
end
