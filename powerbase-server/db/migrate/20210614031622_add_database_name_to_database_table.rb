class AddDatabaseNameToDatabaseTable < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_databases, :database_name, :string, :null => false
  end
end
