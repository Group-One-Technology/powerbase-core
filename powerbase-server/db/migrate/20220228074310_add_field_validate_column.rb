class AddFieldValidateColumn < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :has_validation, :boolean, :default => true, :null => false
    remove_column :powerbase_fields, :allow_dirty_value, :boolean, :default => true, :null => false
    change_column_null :powerbase_fields, :db_type, true
  end
end
