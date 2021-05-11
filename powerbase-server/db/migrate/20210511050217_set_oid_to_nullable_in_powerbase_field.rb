class SetOidToNullableInPowerbaseField < ActiveRecord::Migration[6.1]
  def change
    change_column_null :powerbase_fields, :oid, true
  end
end
