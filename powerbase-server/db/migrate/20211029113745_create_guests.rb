class CreateGuests < ActiveRecord::Migration[6.1]
  def change
    create_table :guests do |t|
      t.string :access, null: false
      t.text :permissions
      t.references :user, foreign_key: true, null: false
      t.references :powerbase_database, foreign_key: true, null: false

      t.timestamps
    end
  end
end
