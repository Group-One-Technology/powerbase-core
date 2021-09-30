class AddSortToTableView < ActiveRecord::Migration[6.1]
  def change
    add_column :table_views, :sort, :text, default: "{}"
  end
end
