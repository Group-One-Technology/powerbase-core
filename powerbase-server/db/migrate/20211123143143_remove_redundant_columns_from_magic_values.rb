class RemoveRedundantColumnsFromMagicValues < ActiveRecord::Migration[6.1]
  def change
    remove_column :magic_values, :data_type, :string
    remove_column :magic_values, :has_precision, :boolean
  end
end
