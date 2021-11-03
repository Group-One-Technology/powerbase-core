class AddDecimalValueToMagicRecords < ActiveRecord::Migration[6.1]
  def change
    add_column :magic_records, :decimal_value, :decimal
  end
end
