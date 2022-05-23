class AddEnableMagicDataToPowerbaseDatabase < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_databases, :enable_magic_data, :boolean, default: false
  end
end
