class DropMagicValue < ActiveRecord::Migration[6.1]
  def change
    drop_table :magic_values
  end
end
