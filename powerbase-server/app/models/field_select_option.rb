class FieldSelectOption < ApplicationRecord
  validates :name, presence: true
  validates :values, presence: true

  belongs_to :powerbase_field
end
