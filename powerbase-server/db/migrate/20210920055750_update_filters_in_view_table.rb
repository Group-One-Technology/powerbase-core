class UpdateFiltersInViewTable < ActiveRecord::Migration[6.1]
  def change
    remove_column :table_views, :filters
    add_column :table_views, :filters, :text, :default => "{}"
  end
end
