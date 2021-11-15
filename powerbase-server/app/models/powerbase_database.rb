class PowerbaseDatabase < ApplicationRecord
  include SequelHelper
  scope :turbo, -> { where(is_turbo: true) }
  alias_attribute :tables, :powerbase_tables

  validates :name, presence: true
  validates :database_name, presence: true
  validates :connection_string, presence: true
  enum adapter: { postgresql: "postgresql", mysql2: "mysql2" }
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
  has_many :guests
  has_one :base_migration
  has_many :powerbase_tables
  has_many :powerbase_fields, through: :powerbase_tables
  has_many :connections, class_name: "BaseConnection", foreign_key: :powerbase_database_id
  has_many :referenced_connections, class_name: "BaseConnection", foreign_key: :referenced_database_id

  def default_table(user)
    guest = Guest.find_by(user_id: user.id, powerbase_database_id: self.id)

    self.powerbase_tables
      .order(order: :asc)
      .select {|table| user.can?(:view_table, table, @guest, false)}
      .first
  end

  def as_indexed_json(options = {})
    as_json(except: [:encrypted_connection_string, :connection_string, :is_turbo])
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

  def sync!(new_connection = false)
    SyncDatabaseWorker.perform_async(self.id, new_connection) unless in_synced?
  end

  def has_row_oid_support?
    begin
      db_version < 12
    rescue
      false
    end
  end

  def db_version
    if postgresql?
      sequel_connect(self) {|db| db.server_version/10000 }
    elsif mysql2?
      # TODO: check mysql version
      nil
    end
  end

  def notifier
    @notifier ||= Powerbase::Notifier.new self
  end

  def create_notifier_function!
    notifier.create_notifier!
  end

  def remove
    tables.each(&:remove)
    base_migration.destroy
    self.destroy
  end
end
