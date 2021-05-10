class CreateTableForeignKeys < ActiveRecord::Migration[6.1]
  def change
    remove_column :powerbase_fields, :is_foreign_key

    create_table :table_foreign_keys do |t|
      t.string :name, null: false
      t.string :columns, array: true, default: [], null: false
      t.string :referenced_columns, array: true, default: [], null: false
      t.belongs_to :powerbase_table, null: false
    end

    add_foreign_key :table_foreign_keys, :powerbase_tables
    add_reference :table_foreign_keys, :referenced_table, foreign_key: { to_table: :powerbase_tables }, null: false
  end
end
