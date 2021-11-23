class RemoveColumnsFromMagicValues < ActiveRecord::Migration[6.1]
  def change
    remove_column :magic_values, :string_value, :string
    remove_column :magic_values, :text_value, :text
    remove_column :magic_values, :decimal_value, :decimal
    remove_column :magic_values, :float_value, :float
    remove_column :magic_values, :boolean_value, :boolean
    remove_column :magic_values, :integer_value, :integer
  end
end
