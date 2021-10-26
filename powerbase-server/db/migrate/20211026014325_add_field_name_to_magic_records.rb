class AddFieldNameToMagicRecords < ActiveRecord::Migration[6.1]
  def change
    add_column :magic_records, :field_name, :string
  end
end
