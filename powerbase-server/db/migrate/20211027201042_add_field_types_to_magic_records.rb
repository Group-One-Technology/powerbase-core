class AddFieldTypesToMagicRecords < ActiveRecord::Migration[6.1]
  def change
    add_column :magic_records, :string_value, :string
    add_column :magic_records, :float_value, :float
    add_column :magic_records, :boolean_value, :boolean
    add_column :magic_records, :integer_value, :integer
  end
end
