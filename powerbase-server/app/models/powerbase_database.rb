class PowerbaseDatabase < ApplicationRecord
  include SequelHelper
  scope :turbo, -> { where(is_turbo: true) }
  alias_attribute :tables, :powerbase_tables

  validates :name, presence: true
  validates :database_name, presence: true
  validates :connection_string, presence: true
  enum adapter: { postgresql: "postgresql", mysql2: "mysql2" }, _prefix: true
  enum color: {
    gray: "gray",
    red: "red",
    yellow: "yellow",
    green: "green",
    blue: "blue",
    indigo: "indigo",
    purple: "purple",
    pink: "pink",
  }, _prefix: true
  attr_encrypted :connection_string, key: ENV["encryption_key"],
    algorithm: "aes-256-cbc", mode: :single_iv_and_salt, insecure_mode: true

  belongs_to :user
  has_one :base_migration
  has_many :powerbase_tables
  has_many :powerbase_fields, through: :powerbase_tables
  has_many :base_connections
  has_many :base_connections, foreign_key: :referenced_database_id

  def as_indexed_json(options = {})
    as_json(except: [:encrypted_connection_string, :connection_string, :is_turbo])
  end

  after_commit on: [:create] do
    logger.debug ["Saving document... ", __elasticsearch__.index_document ].join if self.is_turbo
  end

  def listen!
    con = Powerbase::Listener.new self  
    thread = Thread.new do
      loop do
        con.listen!
      end
    end

    thread.name = thread_name
  end

  def listener_thread
    Thread.list.find{|t| t.name == self.thread_name}
  end

  def thread_name
    "#{self.name}##{self.id}"
  end

  def in_synced?
    unmigrated_tables.empty? && deleted_tables.empty?
  end

  def unmigrated_tables
    tb = _sequel.tables - self.tables.map{|t| t.name.to_sym}
    _sequel.disconnect
    tb
  end

  def deleted_tables
    tb = self.tables.map{|t| t.name.to_sym} - _sequel.tables
    _sequel.disconnect
    tables.where(name: tb.map(&:to_s))
  end

  def _sequel(refresh: false)
    if refresh
      @_sequel.try(:disconnect)
      @_sequel = Sequel.connect self.connection_string
    else
      @_sequel ||= Sequel.connect self.connection_string
    end
  end

  def migration_name
    "PendingTableMigration##{self.id}"
  end
  
  def sync!
    SyncDatabaseWorker.perform_async(self.id) unless in_synced?
  end
end
