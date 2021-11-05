class AddPageSizeToPowerbaseTable < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_tables, :page_size, :integer, default: 50
  end
end
