class AddOrderToTablesAndViews < ActiveRecord::Migration[6.1]
  def up
    add_column :table_views, :order, :integer
    add_column :powerbase_tables, :order, :integer

    databases = PowerbaseDatabase.all
    databases.each do |database|
      tables = PowerbaseTable.where(powerbase_database_id: database.id).order(name: :asc)
      tables.each_with_index do |table, index|
        table.order = index
        table.save

        views = TableView.where(powerbase_table_id: table.id).order(name: :asc)
        views.each_with_index do |view, view_index|
          view.order = view_index
          view.save
        end
      end
    end

    change_column :table_views, :name, :string, null: false, default: "Default"
    change_column :table_views, :order, :integer, null: false
    change_column :powerbase_tables, :order, :integer, null: false
  end

  def down
    remove_column :table_views, :order
    remove_column :powerbase_tables, :order
  end
end
