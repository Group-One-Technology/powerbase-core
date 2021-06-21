class CreateViewFieldOptions < ActiveRecord::Migration[6.1]
  def change
    create_table :view_field_options do |t|
      t.integer :width, default: 300
      t.boolean :is_frozen, default: false
      t.boolean :is_hidden, default: false
      t.integer :order, null: false
      t.references :table_view, null: false, foreign_key: true
      t.references :powerbase_field, null: false, foreign_key: true

      t.timestamps
    end

    remove_column :powerbase_fields, :is_hidden
    remove_column :powerbase_fields, :is_frozen
    remove_column :powerbase_fields, :order
  end
end
