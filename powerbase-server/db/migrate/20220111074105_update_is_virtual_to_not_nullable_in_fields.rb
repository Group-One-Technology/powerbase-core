class UpdateIsVirtualToNotNullableInFields < ActiveRecord::Migration[6.1]
  def up
    change_column_default :powerbase_fields, :is_virtual, false

    fields = PowerbaseField.all
    fields.each do |field|
      field.update(is_virtual: field.is_virtual.to_s.downcase == "true")
    end

    change_column_null :powerbase_fields, :is_virtual, false
  end

  def down
    change_column_default :powerbase_fields, :is_virtual, nil
    change_column_null :powerbase_fields, :is_virtual, true
  end
end
