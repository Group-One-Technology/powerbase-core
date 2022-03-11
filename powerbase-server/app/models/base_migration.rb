class BaseMigration < ApplicationRecord
  validates :database_size, presence: true
  serialize :logs, JSON

  belongs_to :powerbase_database

  def write_error_logs!(error)
    self.logs["errors"] = [] if !self.logs["errors"]
    self.logs["errors"] << error
    self.save
  end
end
