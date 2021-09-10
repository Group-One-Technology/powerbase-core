class BaseMigration < ApplicationRecord
  validates :database_size, presence: true
  belongs_to :powerbase_database
end
