class AddIsAutoLinked < ActiveRecord::Migration[6.1]
  def change
    add_column :base_connections, :is_auto_linked, :boolean, :default => false
  end
end
