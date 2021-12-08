class RemovePrecisionFromPowerbaseField < ActiveRecord::Migration[6.1]
  def change
    remove_column :powerbase_fields, :precision, :integer
  end
end
