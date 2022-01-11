class AddIsConstraintToBaseConnection < ActiveRecord::Migration[6.1]
  def up
    add_column :base_connections, :is_constraint, :boolean, :default => false

    base_connections = BaseConnection.all
    base_connections.each do |connection|
      connection.update(is_constraint: !connection.is_auto_linked)
    end
  end

  def down
    remove_column :base_connections, :is_constraint
  end
end
