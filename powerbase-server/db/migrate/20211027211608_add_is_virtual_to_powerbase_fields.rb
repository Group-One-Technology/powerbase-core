class AddIsVirtualToPowerbaseFields < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :is_virtual, :boolean
  end
end
