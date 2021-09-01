class UpdateTableForeignKeysToBaseConnections < ActiveRecord::Migration[6.1]
  def change
    rename_table :table_foreign_keys, :base_connections

    add_reference :base_connections, :powerbase_database, foreign_key: { to_table: :powerbase_databases }
    add_reference :base_connections, :referenced_database, foreign_key: { to_table: :powerbase_databases }

    foreign_keys = BaseConnection.all
    foreign_keys.each do |key|
      key.powerbase_database_id = key.powerbase_table.powerbase_database_id
      key.referenced_database_id = key.referenced_table.powerbase_database_id
      key.save
    end

    change_column_null :base_connections, :powerbase_database_id, false
    change_column_null :base_connections, :referenced_database_id, false
  end
end
