class AddIsVirtualToPowerbaseTables < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_tables, :is_virtual, :boolean, default: false
  end
end
