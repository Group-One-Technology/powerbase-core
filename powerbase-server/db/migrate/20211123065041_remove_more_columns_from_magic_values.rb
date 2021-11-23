class RemoveMoreColumnsFromMagicValues < ActiveRecord::Migration[6.1]
  def change
    remove_column :magic_values, :database_id, :integer
    remove_column :magic_values, :is_magic_cell, :boolean
    remove_column :magic_values, :record_id, :integer
    add_column :magic_values, :composed_record_identifier, :string
    add_column :magic_values, :value, :text
  end
end
