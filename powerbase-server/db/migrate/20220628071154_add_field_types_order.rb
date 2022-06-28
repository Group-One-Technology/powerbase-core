class AddFieldTypesOrder < ActiveRecord::Migration[6.1]
  def up
    add_column :powerbase_field_types, :order, :integer, null: true

    field_type = PowerbaseFieldType.find_by(name: "Single Line Text")
    field_type&.update(order: 0)

    field_type = PowerbaseFieldType.find_by(name: "Long Text")
    field_type&.update(order: 1)

    field_type = PowerbaseFieldType.find_by(name: "Number")
    field_type&.update(order: 2)

    field_type = PowerbaseFieldType.find_by(name: "Checkbox")
    field_type&.update(order: 3)
    
    field_type = PowerbaseFieldType.find_by(name: "Single Select")
    field_type&.update(order: 4)

    field_type = PowerbaseFieldType.find_by(name: "Multiple Select")
    field_type&.update(order: 5)

    field_type = PowerbaseFieldType.find_by(name: "Date")
    field_type&.update(order: 6)

    field_type = PowerbaseFieldType.find_by(name: "Email")
    field_type&.update(order: 7)

    field_type = PowerbaseFieldType.find_by(name: "URL")
    field_type&.update(order: 8)

    field_type = PowerbaseFieldType.find_by(name: "JSON Text")
    field_type&.update(order: 9)

    field_type = PowerbaseFieldType.find_by(name: "Currency")
    field_type&.update(order: 10)

    field_type = PowerbaseFieldType.find_by(name: "Percent")
    field_type&.update(order: 11)

    field_type = PowerbaseFieldType.find_by(name: "Plugin")
    field_type&.update(order: 12)
    
    field_type = PowerbaseFieldType.find_by(name: "Others")
    field_type&.update(order: 13)

    change_column_null :powerbase_field_types, :order, true
  end
  
  def down
    remove_column :powerbase_field_types, :order, :integer, null: true
  end
end
