class TableView < ApplicationRecord
  validates :name, presence: true
  validates :view_type, presence: true
  enum view_type: { grid: "grid" }
  enum permission: { personal: "personal", collaborative: "collaborative" }
  validates :order, presence: true
  serialize :filters, JSON
  serialize :sort, JSON

  belongs_to :powerbase_table
  belongs_to :creator, class_name: "User"
  has_many :view_field_options, dependent: :destroy
end
