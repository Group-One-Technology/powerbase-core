class CreateHubspotDatabases < ActiveRecord::Migration[6.1]
  def change
    create_table :hubspot_databases do |t|
      t.string :name, null: false
      t.string :encrypted_connection_string, null: false
      t.string :adapter, default: "postgresql"

      # Tracking Hubspot DB to SQL DB migration.
      t.string :database_size, null: false
      t.datetime :start_time
      t.datetime :end_time
      t.boolean :is_migrated, default: false

      t.references :user, foreign_key: true, null: false
      t.references :powerbase_database, foreign_key: true, null: true
      t.timestamps
    end
  end
end
