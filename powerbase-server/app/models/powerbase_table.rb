class PowerbaseTable < ApplicationRecord
  validates :name, presence: true

  belongs_to :powerbase_database
  has_many :powerbase_fields
end
