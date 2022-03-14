class AddConnectionStatsToDatabase < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_databases, :max_connections, :integer, :default => 0, :null => false
  end
end
