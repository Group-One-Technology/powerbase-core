class CreatePowerbaseTables < ActiveRecord::Migration[6.1]
  def change
    create_table :powerbase_tables do |t|
      t.string :name, null: false
      t.text :description
      t.belongs_to :powerbase_database

      t.timestamps
    end
  end
end
