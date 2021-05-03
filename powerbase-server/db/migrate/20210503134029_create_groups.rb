class CreateGroups < ActiveRecord::Migration[6.1]
  def change
    create_table :groups do |t|
      t.string :name, null: false
      t.text :description, null: false
      t.string :connection_string, null: false
      t.string :database_type, default: "postgres"
      t.boolean :is_migrated, default: false

      t.timestamps
    end
  end
end
