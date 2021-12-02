class CreateNotifications < ActiveRecord::Migration[6.1]
  def change
    create_table :notifications do |t|
      t.string :data_type, null: false
      t.text :message, null: false
      t.text :object
      t.boolean :has_read, default: false
      t.references :subject, null: false, foreign_key: { to_table: :users }
      t.references :user, foreign_key: true, null: false
      t.timestamps
    end
  end
end
