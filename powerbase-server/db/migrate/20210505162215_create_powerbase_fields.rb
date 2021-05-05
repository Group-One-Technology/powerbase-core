class CreatePowerbaseFields < ActiveRecord::Migration[6.1]
  def change
    create_table :powerbase_fields do |t|
      t.string :name, null: false
      t.string :description
      t.integer :oid, null: false
      t.string :db_type, null: false
      t.string :default_value
      t.boolean :is_primary_key, default: false
      t.boolean :is_foreign_key, default: false
      t.boolean :is_nullable, default: true
      t.boolean :is_hidden, default: false
      t.boolean :is_frozen, default: false
      t.integer :order, null: false
      t.belongs_to :powerbase_table
      t.belongs_to :powerbase_field_type

      t.timestamps
    end

    add_foreign_key :powerbase_fields, :powerbase_tables
    add_foreign_key :powerbase_fields, :powerbase_field_types
  end
end
