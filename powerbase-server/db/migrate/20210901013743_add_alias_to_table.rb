class AddAliasToTable < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_tables, :alias, :string
  end
end
