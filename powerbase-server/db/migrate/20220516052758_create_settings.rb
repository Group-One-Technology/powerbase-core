class CreateSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :settings do |t|
      t.string :key, null: false
      t.text :value, null: false
      t.string :tag

      t.timestamps
    end
  end
end
