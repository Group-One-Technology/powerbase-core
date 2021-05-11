class UpdateNotNullValues < ActiveRecord::Migration[6.1]
  def change
    change_column_null :powerbase_databases, :database_type, false
    change_column_null :powerbase_databases, :is_migrated, false
    change_column_null :powerbase_tables, :powerbase_database_id, false
    change_column_null :powerbase_field_types, :data_type, false
    change_column_null :powerbase_field_types, :is_virtual, false
    change_column_null :powerbase_fields, :is_primary_key, false
    change_column_null :powerbase_fields, :is_foreign_key, false
    change_column_null :powerbase_fields, :is_nullable, false
    change_column_null :powerbase_fields, :is_hidden, false
    change_column_null :powerbase_fields, :is_frozen, false
    change_column_null :powerbase_fields, :powerbase_table_id, false
    change_column_null :powerbase_fields, :powerbase_field_type_id, false
  end
end
