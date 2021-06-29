class TableView < ApplicationRecord
  validates :name, presence: true
  validates :view_type, presence: true
  enum view_type: { grid: "grid" }, _prefix: true
  serialize :filters, Hash

  belongs_to :powerbase_table
  has_many :view_field_options
end
