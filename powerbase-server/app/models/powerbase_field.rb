class PowerbaseField < ApplicationRecord
  validates :name, presence: true
  validates :db_type, presence: true
  serialize :options, JSON

  belongs_to :powerbase_table
  belongs_to :powerbase_field_type
  has_one :field_select_option
  has_many :view_field_options
end
