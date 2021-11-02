class TableView < ApplicationRecord
  validates :name, presence: true
  validates :view_type, presence: true
  enum view_type: { grid: "grid" }, _prefix: true
  validates :order, presence: true
  serialize :filters, JSON
  serialize :sort, JSON

  belongs_to :powerbase_table
  has_many :view_field_options, dependent: :destroy
end
