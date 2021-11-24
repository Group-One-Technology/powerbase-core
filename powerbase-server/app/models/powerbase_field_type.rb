class PowerbaseFieldType < ApplicationRecord
  validates :name, presence: true
  enum data_type: {
    string: "string",
    number: "number",
    boolean: "boolean",
    enums: "enums",
    array: "array",
    date: "date",
    plugin: "plugin",
    others: "others",
    text: "text",
  }, _prefix: true

  has_many :powerbase_fields
  has_many :field_db_type_mappings
  has_many :magic_values
end
