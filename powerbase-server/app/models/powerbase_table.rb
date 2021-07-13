class PowerbaseTable < ApplicationRecord
  include Elasticsearch::Model
  scope :turbo, -> { joins(:powerbase_database).where(powerbase_database: { is_turbo: true }) }

  validates :name, presence: true

  belongs_to :powerbase_database
  belongs_to :default_view, class_name: "TableView", optional: true
  has_many :powerbase_fields
  has_many :table_foreign_keys
  has_many :table_foreign_keys, foreign_key: :referenced_table_id
  has_many :table_views

  after_commit on: [:create] do
    logger.debug ["Saving document... ", __elasticsearch__.index_document ].join if self.powerbase_database.is_turbo
  end
end
