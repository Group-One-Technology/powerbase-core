class UpdatePowerbaseFieldAndDatabaseColumns < ActiveRecord::Migration[6.1]
  def change
    change_column_null :powerbase_fields, :oid, true
    rename_column :powerbase_databases, :database_type, :adapter
    change_column_default :powerbase_databases, :adapter, "postgresql"
  end
end
