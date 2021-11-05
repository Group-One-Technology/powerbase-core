class ViewFieldOption < ApplicationRecord
  validates :order, presence: true

  belongs_to :table_view
  belongs_to :powerbase_field
end
