class PowerTable < ApplicationRecord
  validates :name, presence: true

  belongs_to :powerbase_database
end
