class AddIsCreatedToPowerbaseDatabases < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_databases, :is_created, :boolean, :default => false
  end
end
