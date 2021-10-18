class CreateTasks < ActiveRecord::Migration[6.1]
  def change
    create_table :tasks do |t|
      t.references :taskable, polymorphic: true, null: false
      t.string :status
      t.string :name
      t.string :identifier
      t.text :object
      t.timestamps
    end
  end
end
