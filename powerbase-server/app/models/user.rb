class User < ApplicationRecord
  include DatabasePermissionsHelper
  include TablePermissionsHelper
  include FieldPermissionsHelper

  include Confirmable
  include Recoverable

  has_secure_password

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true
  validates_uniqueness_of :email

  has_many :notifications
  has_many :unread_notifications, -> { where has_read: false }, class_name: "Notification"
  has_many :powerbase_databases
  has_many :guests, -> { where is_accepted: true }
  has_many :guest_invitations, -> { where is_accepted: false }, class_name: "Guest"
  has_many :views, class_name: "TableView"

  def name
    "#{self.first_name} #{self.last_name}"
  end

  def shared_databases
    database_ids = self.guests.map {|guest| guest.powerbase_database_id}.uniq
    PowerbaseDatabase.where(id: database_ids)
  end

  # * Checks whether the current user has access to the ff:
  # Accepts the following options:
  # :permission :: a given ability to check whether the user can do or not.
  # :resource :: the resource to check the given permission against.
  # :error :: (optional) flag whether it should throw an error or not.
  # :guest :: (optional) the guest object or guest_id
  def can?(permission, resource, error = true, guest = nil)
    resource_type = nil
    database = nil

    if BASE_PERMISSIONS.include?(permission)
      resource_type = :database
      if !resource.is_a?(ActiveRecord::Base)
        database = PowerbaseDatabase.find(resource)
        raise NotFound.new("Could not find database with id of #{resource}.") if !database && error
        return false if !database
      else
        database = resource
      end
    elsif TABLE_PERMISSIONS.include?(permission)
      resource_type = :table
      if !resource.is_a?(ActiveRecord::Base)
        table = PowerbaseTable.find(resource)
        raise NotFound.new("Could not table with id of #{resource}.") if !table && error
        return false if !table
      else
        table = resource
      end

      database = table.powerbase_database
    elsif FIELD_PERMISSIONS.include?(permission)
      resource_type = :field
      if !resource.is_a?(ActiveRecord::Base)
        field = PowerbaseField.find(resource)
        raise NotFound.new("Could not field with id of #{resource}.") if !field && error
        return false if !field
      else
        field = resource
      end

      database = field.powerbase_table.powerbase_database
    elsif VIEW_PERMISSIONS.include?(permission)
      resource_type = :view

      if !resource.is_a?(ActiveRecord::Base)
        view = TableView.find(resource)
        raise NotFound.new("Could not view with id of #{resource}.") if !view && error
        return false if !view
      else
        view = resource
      end

      database = view.powerbase_table.powerbase_database
    end

    return true if database.user_id == self.id

    if permission === :change_guest_access || permission === :remove_guests
      raise AccessDenied if error
      return false
    end

    guest = Guest.find(guest) if !database.is_a?(ActiveRecord::Base)
    guest = guest || Guest.find_by(user_id: self.id, powerbase_database_id: database.id)
    raise AccessDenied if !guest && error
    return false if !guest

    if permission == :view_base
      access = guest != nil
      raise AccessDenied if !access && error
      return access
    end

    if resource_type == :view
      access = if view.personal?
          guest.user_id == view.creator_id
        else
          does_guest_have_access(guest.access, view.access)
        end
      raise AccessDenied if !access && error
      return false
    end

    if guest.access.to_sym != :custom
      permission_key = permission.to_s

      case resource_type
      when :database
        database_access = database.permissions[permission_key]["access"]

        if database_access == "specific users only"
          return true if guest.creator?
          allowed_roles = Array(database.permissions[permission_key]["allowed_roles"])
          return true if allowed_roles.any? {|role| role == guest.access}
          allowed_guests = Array(database.permissions[permission_key]["allowed_guests"])
          return true if allowed_guests.any? {|guest_id| guest_id == guest.id}
          raise AccessDenied if error
          return false
        elsif database_access != DATABASE_DEFAULT_PERMISSIONS[permission][:access]
          access = does_guest_have_access(guest.access, database_access)
          raise AccessDenied if !access && error
          return access
        end
      when :table
        table_access = table.permissions[permission_key]["access"]

        if table_access == "specific users only"
          return true if guest.creator?
          allowed_roles = Array(table.permissions[permission_key]["allowed_roles"])
          return true if allowed_roles.any? {|role| role == guest.access}
          allowed_guests = Array(table.permissions[permission_key]["allowed_guests"])
          return true if allowed_guests.any? {|guest_id| guest_id == guest.id}
          raise AccessDenied if error
          return false
        elsif table_access != TABLE_DEFAULT_PERMISSIONS[permission][:access]
          access =  does_guest_have_access(guest.access, table_access)
          raise AccessDenied if !access && error
          return access
        end
      when :field
        field_access = field.permissions[permission_key]["access"]

        if field_access == "specific users only"
          return true if guest.creator?
          allowed_roles = Array(field.permissions[permission_key]["allowed_roles"])
          return true if allowed_roles.any? {|role| role == guest.access}
          allowed_guests = Array(field.permissions[permission_key]["allowed_guests"])
          return true if allowed_guests.any? {|guest_id| guest_id == guest.id}
          raise AccessDenied if error
          return false
        elsif field_access != FIELD_DEFAULT_PERMISSIONS[permission][:access]
          access = does_guest_have_access(guest.access, field_access)
          raise AccessDenied if !access && error
          return access
        end
      end

      permissions = ROLES[guest.access.to_sym]
      return true if permissions.include?(:all)
      return true if permissions.include? permission
    else
      permission_key = permission.to_s
      case resource_type
      when :database
        return true if guest.permissions[permission_key] == true
      when :table
        table_id = table.id.to_s
        return true if guest.permissions["tables"][table_id] && guest.permissions["tables"][table_id][permission_key] == true

        restricted_guests = Array(table.permissions[permission_key]["restricted_guests"])
        is_restricted = restricted_guests.any? {|guest_id| guest_id == guest.id}
        raise AccessDenied if is_restricted && error
        return false if is_restricted

        return true if does_guest_have_access("custom", table.permissions[permission_key]["access"])

        allowed_guests = Array(table.permissions[permission_key]["allowed_guests"])
        return true if allowed_guests.any? {|guest_id| guest_id == guest.id}
      when :field
        field_id = field.id.to_s
        return true if guest.permissions["fields"][field_id] && guest.permissions["fields"][field_id][permission_key] == true

        restricted_guests = Array(field.permissions[permission_key]["restricted_guests"])
        is_restricted = restricted_guests.any? {|guest_id| guest_id == guest.id}
        raise AccessDenied if is_restricted && error
        return false if is_restricted

        return true if does_guest_have_access("custom", field.permissions[permission_key]["access"])

        allowed_guests = Array(field.permissions[permission_key]["allowed_guests"])
        return true if allowed_guests.any? {|guest_id| guest_id == guest.id}
      end
    end

    raise AccessDenied if error
    return false
  end
end
