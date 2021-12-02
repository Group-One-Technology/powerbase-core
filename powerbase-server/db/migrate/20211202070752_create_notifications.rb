class CreateNotifications < ActiveRecord::Migration[6.1]
  def change
    create_table :notifications do |t|
      t.string :data_type, null: false
      t.text :message, null: false
      t.boolean :has_read, default: false
      t.references :user, foreign_key: true, null: false
      t.datetime :created_at, null: false
    end
  end
end
