class PowerbaseTable < ApplicationRecord
  validates :name, presence: true

  belongs_to :powerbase_database
  has_many :powerbase_fields
  has_many :table_foreign_keys
  has_many :table_foreign_keys, foreign_key: :referenced_table_id
end
