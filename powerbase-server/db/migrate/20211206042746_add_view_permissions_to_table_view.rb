class AddViewPermissionsToTableView < ActiveRecord::Migration[6.1]
  def change
    add_column :table_views, :permission, :string, :default => 'collaborative'
    add_column :table_views, :is_locked, :boolean, :default => false
  end
end
