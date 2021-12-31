class AddFieldTypesData < ActiveRecord::Migration[6.1]
  def change
    remove_column :powerbase_field_types, :is_virtual, :boolean, default: false, null: false

    field_type = PowerbaseFieldType.find_by(name: "Plugin") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Plugin"
      field_type.description = "A type that uses hooks up a plugin made by other devs."
      field_type.data_type = "plugin"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Others") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Others"
      field_type.description = "A db_type that hasn't been mapped yet."
      field_type.data_type = "others"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Long Text") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Long Text"
      field_type.description = "A long string."
      field_type.data_type = "string"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "JSON Text") || PowerbaseFieldType.new
    if field_type
      field_type.name = "JSON Text"
      field_type.description = "A JSON in a form of a string."
      field_type.data_type = "string"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Single Select") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Single Select"
      field_type.description = "Shows a list of options in which a user only selects a single one."
      field_type.data_type = "enums"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Multiple Select") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Multiple Select"
      field_type.description = "Shows a list of options in which a user can select multiple options."
      field_type.data_type = "array"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Date") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Date"
      field_type.description = "A date."
      field_type.data_type = "date"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "URL") || PowerbaseFieldType.new
    if field_type
      field_type.name = "URL"
      field_type.description = "A link to a web page."
      field_type.data_type = "string"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Currency") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Currency"
      field_type.description = "Money, a medium of exchange for goods and services."
      field_type.data_type = "number"
      field_type.save
    end

    field_type = PowerbaseFieldType.find_by(name: "Percent") || PowerbaseFieldType.new
    if field_type
      field_type.name = "Percent"
      field_type.description = "Number or ratio expressed as a fraction of 100"
      field_type.data_type = "number"
      field_type.save
    end

    number = PowerbaseFieldType.find_by(name: "Number")

    if number
      numeric_db_type = FieldDbTypeMapping.find_or_create_by(db_type: "numeric", adapter: "sequel", powerbase_field_type_id: number.id)

      fields = PowerbaseField.where("db_type ILIKE '%numeric%'")
      fields.each do |field|
        field.powerbase_field_type_id = number.id
        field.save
      end
    end

  end
end
