class TableView < ApplicationRecord
  validates :name, presence: true
  validates :view_type, presence: true
  enum view_type: { grid: "grid" }, _prefix: true

  belongs_to :powerbase_table
end
