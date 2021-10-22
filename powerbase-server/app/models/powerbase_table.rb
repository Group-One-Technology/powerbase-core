class PowerbaseTable < ApplicationRecord
  include Elasticsearch::Model

  alias_attribute :fields, :powerbase_fields
  alias_attribute :db, :powerbase_database

  scope :turbo, -> { joins(:powerbase_database).where(powerbase_database: { is_turbo: true }) }

  validates :name, presence: true
  validates :order, presence: true
  serialize :logs, JSON

  belongs_to :powerbase_database
  belongs_to :default_view, class_name: "TableView", optional: true
  has_many :powerbase_fields
  has_many :base_connections
  has_many :base_connections, foreign_key: :referenced_table_id
  has_many :table_views
  has_many :primary_keys, -> { where is_primary_key: true }, class_name: "PowerbaseField"

  after_commit on: [:create] do
    logger.debug ["Saving document... ", __elasticsearch__.index_document ].join if self.powerbase_database.is_turbo
  end

  def index_name
    "table_records_#{id}"
  end

  def has_primary_key?
    primary_keys.any?
  end

  def in_synced?
    unmigrated_columns.empty?
  end

  def unmigrated_columns
    columns = _sequel.schema(self.name.to_sym).reject{|t| self.fields.map{|t| t.name.to_sym}.include? t[0]}
    # Disconnect after query
    self._sequel.disconnect
    columns
  end
  
  def _sequel_table
    self._sequel.from(self.name.to_sym)
  end

  def _sequel
    db._sequel
  end

  def sync!
    SyncTableWorker.perform_async(self.id)
  end

  def migration_worker_name
    "PendingColumnMigration##{self.id}"
  end

  def reindex!
    migrator.index!
  end

  def migrator
    @migrator ||= Tables::Migrator.new self
  end

end
