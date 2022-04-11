class PowerbaseTable < ApplicationRecord
  include PusherHelper
  include Notifier
  include Indexable
  include TableSchemaModification
  include ElasticsearchHelper
  include TablePermissionsHelper

  alias_attribute :fields, :powerbase_fields
  alias_attribute :db, :powerbase_database

  scope :turbo, -> { joins(:powerbase_database).where(powerbase_database: { is_turbo: true }) }

  validates :name, presence: true
  validates :order, presence: true
  serialize :logs, JSON
  serialize :permissions, JSON
  alias_attribute :fields, :powerbase_fields
  alias_attribute :views, :table_views

  belongs_to :powerbase_database
  belongs_to :default_view, class_name: "TableView", optional: true
  has_many :powerbase_fields, dependent: :destroy
  has_many :connections, class_name: "BaseConnection", foreign_key: :powerbase_table_id
  has_many :referenced_connections, class_name: "BaseConnection", foreign_key: :referenced_table_id
  has_many :table_views, dependent: :destroy
  has_many :primary_keys, -> { where is_primary_key: true }, class_name: "PowerbaseField"
  has_many :actual_fields, -> { where is_virtual: false }, class_name: "PowerbaseField"
  has_many :magic_fields, -> { where is_virtual: true }, class_name: "PowerbaseField"
  has_many :collaborative_views, -> { where permission: "collaborative" }, class_name: "TableView"
  has_many :personal_views, -> { where permission: "personal" }, class_name: "TableView"

  after_create :add_migration_attributes

  def add_migration_attributes
    self.logs["migration"] = {
      total_records: 0,
      offset: 0,
      indexed_records: 0,
      start_time: Time.now,
      end_time: Time.now,
      errors: []
    }
    self.save
  end

  def default_view
    super || table_views.first
  end

  def default_view_id
    super || table_views.try(:first).try(:id)
  end

  def index_name
    "table_records_#{id}"
  end

  def status
    if self.logs["migration"] == nil
      self.logs["migration"] = { status: "migrated" }
      self.save
    end

    self.logs["migration"]["status"] || "migrated"
  end

  def connection_string
    db.connection_string
  end

  def has_primary_key?
    primary_keys.any?
  end

  def _sequel_table
    self._sequel.from(self.name.to_sym)
  end

  def _sequel
    @_sequel = db._sequel(refresh: true)
  end

  def sync!(new_connection: false, reindex: true)
    SyncTableWorker.perform_async(self.id, new_connection, reindex)
  end

  def migration_worker_name
    "PendingColumnMigration##{self.id}"
  end

  def migrator
    @migrator ||= Tables::Migrator.new self
  end

  def notifier
    @notifier ||= Powerbase::Notifier.new self.db
  end

  def remove
    self.default_view_id = nil
    self.save
    BaseConnection.where(powerbase_table_id: self.id).destroy_all
    BaseConnection.where(referenced_table_id: self.id).destroy_all
    delete_index(self.index_name)
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

    TABLE_DEFAULT_PERMISSIONS.each do |key, value|
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

  def write_migration_logs!(status: nil, total_records: nil, offset: nil, indexed_records: nil, start_time: nil, end_time: nil, error: nil, unmigrated_columns: nil, old_primary_keys: nil)
    if status.present?
      self.logs["migration"]["status"] = status
      if status == "migrated"
        self.is_migrated = true
      elsif self.is_migrated
        self.is_migrated = false
      end
    end
    self.logs["migration"]["total_records"] = total_records if total_records.present?
    self.logs["migration"]["offset"] = offset if offset.present?
    self.logs["migration"]["indexed_records"] = indexed_records if indexed_records.present?
    self.logs["migration"]["start_time"] = start_time if start_time.present?
    self.logs["migration"]["end_time"] = end_time if end_time.present?
    self.logs["migration"]["errors"] << error if error.present?
    self.logs["migration"]["unmigrated_columns"] = unmigrated_columns if unmigrated_columns != nil
    self.logs["migration"]["old_primary_keys"] = old_primary_keys if old_primary_keys != nil
    self.save

    if status.present?
      pusher_trigger!("table.#{self.id}", "notifier-migration-listener", { id: self.id })
    end
  end
end
