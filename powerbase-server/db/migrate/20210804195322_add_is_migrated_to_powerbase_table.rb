class AddIsMigratedToPowerbaseTable < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_tables, :is_migrated, :boolean, default: false
  end
end
