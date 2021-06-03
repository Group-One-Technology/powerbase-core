class CreateTableViews < ActiveRecord::Migration[6.1]
  def change
    create_table :table_views do |t|
      t.string :name, null: false, default: "Grid"
      t.string :view_type, null: false, default: "grid"
      t.references :powerbase_table, foreign_key: true, null: false

      t.timestamps
    end
  end
end
