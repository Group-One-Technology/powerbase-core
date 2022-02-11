class PowerbaseDatabase < ApplicationRecord
  include SequelHelper
  include DatabasePermissionsHelper
  include PusherHelper

  scope :turbo, -> { where(is_turbo: true) }
  alias_attribute :tables, :powerbase_tables

  validates :name, presence: true
  validates :database_name, presence: true
  validates :connection_string, presence: true
  enum adapter: { postgresql: "postgresql", mysql2: "mysql2" }
  enum status: {
    analyzing_base: "analyzing_base",
    migrating_metadata: "migrating_metadata",
    adding_connections: "adding_connections",
    creating_listeners: "creating_listeners",
    indexing_records: "indexing_records",
    migrated: "migrated",
  }
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
  serialize :permissions, JSON

  belongs_to :user
  has_many :guests, dependent: :destroy
  has_one :base_migration, dependent: :destroy
  has_many :powerbase_tables
  has_many :powerbase_fields, through: :powerbase_tables
  has_many :connections, class_name: "BaseConnection", foreign_key: :powerbase_database_id
  has_many :referenced_connections, class_name: "BaseConnection", foreign_key: :referenced_database_id

  def default_table(user)
    guest = Guest.find_by(user_id: user.id, powerbase_database_id: self.id)

    self.powerbase_tables
      .order(order: :asc)
      .select {|table| !table.is_hidden}
      .select {|table| user.can?(:view_table, table, false, @guest)}
      .first
  end

  def as_indexed_json(options = {})
    as_json(except: [:encrypted_connection_string, :connection_string, :is_turbo])
  end

  def listen!
    con = Powerbase::Listener.new self
    begin
      thread = Thread.new do
        loop do
          con.listen!
        end
      end
      thread.abort_on_exception = true
      thread.name = thread_name
    rescue => ex
      puts "-- Thread::Error #{ex}"
    end
  end

  def listener_thread
    Thread.list.find{|t| t.name == self.thread_name}
  end

  def thread_name
    "#{self.name}##{self.id}"
  end

  def is_migrating?
    migrating_tables.any?
  end

  def in_synced?
    unmigrated_tables.empty? && deleted_tables.empty?
  end

  def unmigrated_tables
    tb = _sequel.tables - self.tables.map{|t| t.name.to_sym}
    _sequel.disconnect
    tb
  end

  def migrating_tables
    self.tables.where(is_migrated: false)
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

    @_sequel.extension :pg_enum if self.postgresql?
    @_sequel
  end

  def migration_name
    "PendingTableMigration##{self.id}"
  end

  def sync!(new_connection = false)
    SyncDatabaseWorker.perform_async(self.id, new_connection)
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

  def update_status!(status)
    self.status = status
    self.save

    if status == "migrated"
      self.base_migration.end_time = Time.now
      self.base_migration.save
    end

    pusher_trigger!("database.#{self.id}", "migration-listener", { id: self.id })
  end

  def remove
    tables.each(&:remove)
    base_migration.destroy
    self.destroy
  end

  def update_guests_access(options)
    guest = options[:guest]
    is_allowed = options[:is_allowed]
    permission = options[:permission].to_s
    access = options[:access].to_s

    allowed_guests = Array(self.permissions[permission]["allowed_guests"])
    restricted_guests = Array(self.permissions[permission]["restricted_guests"])

    if is_allowed == true
      restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}
      allowed_guests.push(guest.id) if !does_guest_have_access("custom", access)
    else
      allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
      restricted_guests.push(guest.id) if does_guest_have_access("custom", access)
    end

    self.permissions[permission]["allowed_guests"] = allowed_guests.uniq
    self.permissions[permission]["restricted_guests"] = restricted_guests.uniq
    self.save
  end

  def update_guest(guest, permission, is_allowed)
    permission = permission.to_s
    has_access = does_guest_have_access("custom", self.permissions[permission]["access"])
    allowed_guests = Array(self.permissions[permission]["allowed_guests"])
    restricted_guests = Array(self.permissions[permission]["restricted_guests"])

    if is_allowed
      restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}

      if has_access
        allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
      else
        allowed_guests.push(guest.id)
      end
    else
      allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}

      if !has_access
        restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}
      else
        restricted_guests.push(guest.id)
      end
    end

    self.permissions[permission]["allowed_guests"] = allowed_guests.uniq
    self.permissions[permission]["restricted_guests"] = restricted_guests.uniq
    self.save
  end

  def remove_guest(guest_id, permission = nil)
    if permission != nil
      _remove_guest_for_permission(guest_id, permission)
      return
    end

    DATABASE_DEFAULT_PERMISSIONS.each do |key, value|
      _remove_guest_for_permission(guest_id, key)
    end
  end

  def _remove_guest_for_permission(guest_id, permission)
    permission = permission.to_s

    allowed_guests = Array(self.permissions[permission]["allowed_guests"])
    restricted_guests = Array(self.permissions[permission]["restricted_guests"])

    allowed_guests = allowed_guests.select {|id| id != guest_id}
    restricted_guests = restricted_guests.select {|id| id != guest_id}

    self.permissions[permission]["allowed_guests"] = allowed_guests.uniq
    self.permissions[permission]["restricted_guests"] = restricted_guests.uniq
    self.save
  end
end
