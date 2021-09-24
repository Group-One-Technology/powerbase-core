class AddLogsToPowerbaseTable < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_tables, :logs, :text, :default => "{}"
  end
end
