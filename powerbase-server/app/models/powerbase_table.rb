class PowerbaseTable < ApplicationRecord
  include Elasticsearch::Model
  alias_attribute :fields, :powerbase_fields

  scope :turbo, -> { joins(:powerbase_database).where(powerbase_database: { is_turbo: true }) }

  validates :name, presence: true
  serialize :logs, JSON

  belongs_to :powerbase_database
  belongs_to :default_view, class_name: "TableView", optional: true
  has_many :powerbase_fields
  has_many :base_connections
  has_many :base_connections, foreign_key: :referenced_table_id
  has_many :table_views

  after_commit on: [:create] do
    logger.debug ["Saving document... ", __elasticsearch__.index_document ].join if self.powerbase_database.is_turbo
  end


  def index_name
    "table_records_#{id}"
  end

  def primary_keys
    fields.select {|field| field.is_primary_key }
  end
end
