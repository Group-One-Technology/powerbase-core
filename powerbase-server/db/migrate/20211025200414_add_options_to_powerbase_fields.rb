class AddOptionsToPowerbaseFields < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :options, :text
  end
end
