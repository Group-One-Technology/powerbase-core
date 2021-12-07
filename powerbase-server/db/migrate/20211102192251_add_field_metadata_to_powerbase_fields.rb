class AddFieldMetadataToPowerbaseFields < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :allow_dirty_value, :boolean
  end
end
