class CreateFieldSelectOptions < ActiveRecord::Migration[6.1]
  def change
    create_table :field_select_options do |t|
      t.string :name, null: false
      t.string :values, array: true, default: [], null: false
      t.belongs_to :powerbase_field, null: false
    end

    add_foreign_key :field_select_options, :powerbase_fields
  end
end
