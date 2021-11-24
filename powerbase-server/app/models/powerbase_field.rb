class PowerbaseField < ApplicationRecord
  include PermissionsHelper
  include FieldPermissionsHelper

  validates :name, presence: true
  validates :db_type, presence: true
  serialize :options, JSON
  serialize :permissions, JSON

  belongs_to :powerbase_table
  belongs_to :powerbase_field_type
  has_one :field_select_option, dependent: :destroy
  has_many :view_field_options, dependent: :destroy
  has_many :magic_values, foreign_key: "pk_field_id"

  def update_guests_access(options)
    guest = options[:guest]
    is_allowed = options[:is_allowed]
    permission = options[:permission].to_s
    access = options[:access].to_s

    allowed_guests = Array(self.permissions[permission]["allowed_guests"])
    restricted_guests = Array(self.permissions[permission]["restricted_guests"])

    if is_allowed == true
      restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}
      allowed_guests.push(guest.id) if !does_custom_have_access(access)
    else
      allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
      restricted_guests.push(guest.id) if does_custom_have_access(access)
    end

    self.permissions[permission]["allowed_guests"] = allowed_guests.uniq
    self.permissions[permission]["restricted_guests"] = restricted_guests.uniq
    self.save
  end

  def update_guest(guest, permission, is_allowed)
    permission = permission.to_s
    has_access = does_custom_have_access(self.permissions[permission]["access"])
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
