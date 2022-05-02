class UpdateDataTypeForBoolAndJsonText < ActiveRecord::Migration[6.1]
  def change
    json_text = PowerbaseFieldType.find_by(name: "JSON Text")
    json_text.update(data_type: "string") if json_text

    bool = FieldDbTypeMapping.find_by(db_type: "boolean", adapter: "sequel")
    bool.update(db_type: "bool") if bool
  end
end
