class AddFieldValidateColumn < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :has_validation, :boolean, :default => true, :null => false
  end
end
