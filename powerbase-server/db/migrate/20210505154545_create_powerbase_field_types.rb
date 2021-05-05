class CreatePowerbaseFieldTypes < ActiveRecord::Migration[6.1]
  def change
    create_table :powerbase_field_types do |t|
      t.string :name, null: false
      t.text :description
      t.string :data_type, default: "string"
      t.boolean :is_virtual, default: false

      t.timestamps
    end
  end
end
