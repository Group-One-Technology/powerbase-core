class BaseMigration < ApplicationRecord
  validates :database_size, presence: true
  serialize :logs, JSON

  belongs_to :powerbase_database
end
