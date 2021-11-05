class FieldDbTypeMapping < ApplicationRecord
  validates :db_type, presence: true
  enum adapter: { sequel: "sequel" }, _prefix: true

  belongs_to :powerbase_field_type
end
