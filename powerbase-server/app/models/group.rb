class Group < ApplicationRecord
  validates :name, presence: true
  validates :description, presence: true
  validates :connection_string, presence: true
  enum database_type: { postgres: "postgres" }, _prefix: :database
end
