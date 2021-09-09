class BaseMigration < ApplicationRecord
  validates :database_size, presence: true
  serialize :errors, JSON

  belongs_to :powerbase_database
end
