class PowerbaseField < ApplicationRecord
  validates :name, presence: true
  validates :oid, presence: true
  validates :db_type, presence: true
  validates :order, presence: true

  belongs_to :powerbase_table
end
