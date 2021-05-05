class CreatePowerTables < ActiveRecord::Migration[6.1]
  def change
    create_table :power_tables do |t|
      t.string :name, null: false
      t.text :description
      t.belongs_to :powerbase_database

      t.timestamps
    end
  end
end
