class PowerbaseFieldType < ApplicationRecord
  validates :name, presence: true
  enum data_type: {
    string: "string",
    text: "text",
    number: "number",
    boolean: "boolean",
  }, _prefix: true

  has_many :powerbase_fields
  has_many :field_db_type_mapping
end
