class Databases::Updater
  include PermissionsHelper
  include DatabasePermissionsHelper

  attr_accessor :database

  def initialize(database)
    @database = database
  end

  def update_access!(permission, access)
    return if (permission == access)

    permission = permission.underscore
    default_access = DATABASE_DEFAULT_PERMISSIONS[permission.to_sym][:access]
    default_value = DATABASE_DEFAULT_PERMISSIONS[permission.to_sym][:default_value]
    guests = Guest.where(access: "custom", powerbase_database_id: @database.id)
    has_access = does_guest_have_access("custom", access)

    if access == default_access
      guests.each do |guest|
        guest.permissions[permission] = default_value if guest.permissions[permission] == nil

        if guest.permissions[permission] == default_value
          @database.remove_guest(guest.id, permission)
        else
          @database.update_guests_access({
            permission: permission,
            access: access,
            guest: guest,
            is_allowed: guest.permissions[permission]
          })
        end
      end
    else
      guests.each do |guest|
        guest.permissions[permission] = default_value if guest.permissions[permission] == nil

        if guest.permissions[permission] != has_access
          @database.update_guests_access({
            permission: permission,
            access: access,
            guest: guest,
            is_allowed: guest.permissions[permission]
          })
        else
          @database.remove_guest(guest.id, permission)
        end
      end
    end

    allowed_guests = Array(@database.permissions[permission]["allowed_guests"])
    restricted_guests = Array(@database.permissions[permission]["restricted_guests"])

    @database.permissions[permission]["allowed_guests"] = allowed_guests.select {|guest_id| guests.any? {|guest| guest.id == guest_id} }
    @database.permissions[permission]["restricted_guests"] = restricted_guests.select {|guest_id| guests.any? {|guest| guest.id == guest_id} }
    @database.permissions[permission]["access"] = access
    @database.save
  end

  def update_allowed_roles!(permission, roles)
    permission = permission.underscore
    allowed_roles = Array(roles).select {|role| ROLES[role.to_sym] != nil}
    @database.permissions[permission]["allowed_roles"] = allowed_roles
    @database.save
  end
end
