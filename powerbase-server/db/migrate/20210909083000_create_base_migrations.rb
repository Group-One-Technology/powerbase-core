class CreateBaseMigrations < ActiveRecord::Migration[6.1]
  def change
    create_table :base_migrations do |t|
      t.datetime :start_time
      t.datetime :end_time
      t.string :database_size, null: false
      t.text :logs
      t.integer :retries, null: false, default: 0
      t.references :powerbase_database, null: false, foreign_key: true
    end
  end
end
