class AddViewPermissionsToTableView < ActiveRecord::Migration[6.1]
  def change
    add_column :table_views, :permission, :string, :default => 'collaborative'
    add_column :table_views, :is_locked, :boolean, :default => false
    add_reference :table_views, :creator, foreign_key: { to_table: :users }, null: true

    databases = PowerbaseDatabase.all
    databases.each do |database|
      user_id = database.user_id

      database.tables.each do |table|
        views = table.views

        views.each do |view|
          view.update(creator_id: user_id)
        end
      end
    end

    change_column_null :table_views, :creator_id, false
  end
end
