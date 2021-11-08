class AddMagicRecordToMagicValues < ActiveRecord::Migration[6.1]
  def change
    add_reference :magic_values, :magic_record, foreign_key: true
  end
end
