class AddColorToTables < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_databases, :color, :string, :default => 'gray'
  end
end
