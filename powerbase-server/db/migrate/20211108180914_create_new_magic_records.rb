class CreateNewMagicRecords < ActiveRecord::Migration[6.1]
  def change
    create_table :magic_records do |t|
      t.integer :powerbase_record_order
      t.references :powerbase_database, null: false, foreign_key: true
      t.references :powerbase_table, null: false, foreign_key: true

      t.timestamps
    end
  end
end
