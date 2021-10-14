class AddIsPiiToPowerbaseFields < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :is_pii, :boolean, :default => false, null: false
  end
end
