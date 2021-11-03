class AddFieldTypeIdToMagicRecords < ActiveRecord::Migration[6.1]
  def change
    add_column :magic_records, :field_type_id, :integer
  end
end
