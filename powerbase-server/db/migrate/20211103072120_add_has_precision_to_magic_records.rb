class AddHasPrecisionToMagicRecords < ActiveRecord::Migration[6.1]
  def change
    add_column :magic_records, :has_precision, :boolean, default: false
  end
end
