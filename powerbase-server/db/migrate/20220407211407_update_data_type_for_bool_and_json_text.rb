class UpdateDataTypeForBoolAndJsonText < ActiveRecord::Migration[6.1]
  def change
    json_text = PowerbaseFieldType.find_by(name: "JSON Text")
    json_text.update(data_type: "string")

    bool = FieldDbTypeMapping.find_by(db_type: "boolean", adapter: "sequel")
    bool.update(db_type: "bool")
  end
end
