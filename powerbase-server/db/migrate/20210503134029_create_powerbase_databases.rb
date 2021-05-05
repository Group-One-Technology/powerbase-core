class CreatePowerbaseDatabases < ActiveRecord::Migration[6.1]
  def change
    create_table :powerbase_databases do |t|
      t.string :name, null: false
      t.text :description
      t.string :encrypted_connection_string, null: false
      t.string :database_type, default: "postgres"
      t.boolean :is_migrated, default: false

      t.timestamps
    end
  end
end
