class SetEncryptedValueToNullInSettings < ActiveRecord::Migration[6.1]
  def change
    change_column_null :settings, :encrypted_value, true
  end
end
