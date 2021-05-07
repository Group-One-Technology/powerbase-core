class CreateFieldDbTypeMappings < ActiveRecord::Migration[6.1]
  def change
    create_table :field_db_type_mappings do |t|
      t.string :db_type, null: false
      t.string :adapter, null: false, default: "sequel"
      t.belongs_to :powerbase_field_type, null: false
    end

    add_foreign_key :field_db_type_mappings, :powerbase_field_types
  end
end
