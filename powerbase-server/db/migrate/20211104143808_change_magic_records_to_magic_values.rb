class ChangeMagicRecordsToMagicValues < ActiveRecord::Migration[6.1]
  def change
    rename_table :magic_records, :magic_values
  end
end
