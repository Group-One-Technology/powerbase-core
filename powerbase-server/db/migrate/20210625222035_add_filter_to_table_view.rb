class AddFilterToTableView < ActiveRecord::Migration[6.1]
  def change
    add_column :table_views, :filters, :text
  end
end
