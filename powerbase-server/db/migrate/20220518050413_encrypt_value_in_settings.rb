class EncryptValueInSettings < ActiveRecord::Migration[6.1]
  def change
    remove_column :settings, :value, :text, null: false
    add_column :settings, :encrypted_value, :text, null: false
  end
end
