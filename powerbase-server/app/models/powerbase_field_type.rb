class PowerbaseFieldType < ApplicationRecord
  validates :name, presence: true
  enum data_type: {
    string: "string",
    text: "text",
    number: "number",
    boolean: "boolean",
  }
end
