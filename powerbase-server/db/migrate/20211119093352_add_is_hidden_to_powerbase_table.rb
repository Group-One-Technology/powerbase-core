class AddIsHiddenToPowerbaseTable < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_tables, :is_hidden, :boolean, :default => false
  end
end
