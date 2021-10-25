class CreateMagicRecords < ActiveRecord::Migration[6.1]
  def change
    create_table :magic_records do |t|
      t.integer :table_id
      t.integer :record_id
      t.integer :database_id
      t.boolean :is_magic_cell
      t.integer :field_id
      t.string :data_type
      t.text :text_value

      t.timestamps
    end
  end
end
