class PowerbaseDatabase < ApplicationRecord
  include Elasticsearch::Model
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
  has_many :tasks, as: :taskable
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

    thread.name = self.name
  end

  def is_synced?
    unmigrated_tables.empty?
  end

  def unmigrated_tables
    sequel_db_tables.reject{|t| self.tables.map{|t| t.name.to_sym}.include? t}
  end

  def sequel_db_tables
    _sequel.tables
  end

  def _sequel
    @_sequel ||= Sequel.connect self.connection_string
  end

  def pending_tasks
    tasks.pending
  end
end
