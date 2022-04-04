include PermissionsHelper
include FieldPermissionsHelper
include ElasticsearchHelper

class PowerbaseField < ApplicationRecord

  validates :name, presence: true
  serialize :options, JSON
  serialize :permissions, JSON

  alias_attribute :field_type, :powerbase_field_type
  alias_attribute :table, :powerbase_table

  belongs_to :powerbase_table
  belongs_to :powerbase_field_type
  has_one :field_select_option, dependent: :destroy
  has_many :view_field_options, dependent: :destroy

  def is_decimal?
    return false if self.field_type.name != "Number"

    if self.db_type != nil
      ["numeric", "decimal"].any? {|db_type| self.db_type.include?(db_type) }
    else
      self.options != nil && self.options.precision != nil && self.options.precision > 0
    end
  end

  def drop(sync_db = true)
    field_name = self.name
    table = self.table

    # Drop column in Sequel
    if !self.is_virtual && sync_db
      schema = Tables::Schema.new table
      schema.drop_column(field_name)
    end

    # Remove column for every doc under index_name
    remove_column(table.index_name, field_name)

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

    FIELD_DEFAULT_PERMISSIONS.each do |key, value|
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
