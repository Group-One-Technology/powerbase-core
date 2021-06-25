class AddDefaultViewToPowerbaseTable < ActiveRecord::Migration[6.1]
  def change
    add_reference :powerbase_tables, :default_view, foreign_key: { to_table: :table_views }
  end
end
