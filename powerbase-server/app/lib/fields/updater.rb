class Fields::Updater
  include PermissionsHelper
  include FieldPermissionsHelper

  attr_accessor :field

  def initialize(field)
    @field = field
  end

  def update_access!(permission, access)
    return if (permission == access)

    permission = permission.underscore
    default_access = FIELD_DEFAULT_PERMISSIONS[permission.to_sym][:access]
    default_value = FIELD_DEFAULT_PERMISSIONS[permission.to_sym][:default_value]
    guests = Guest.where(access: "custom", powerbase_database_id: @field.powerbase_table.powerbase_database_id)
    has_access = does_custom_have_access(access)

    if access == default_access
      guests.each do |guest|
        field_id = @field.id.to_s
        guest.permissions["fields"] = {} if guest.permissions["fields"] == nil
        guest.permissions["fields"][field_id] = {} if guest.permissions["fields"][field_id] == nil
        guest.permissions["fields"][field_id][permission] = default_value if guest.permissions["fields"][field_id][permission] == nil

        if guest.permissions["fields"][field_id][permission] == default_value
          @field.remove_guest(guest.id, permission)
        else
          @field.update_guests_access({
            permission: permission,
            access: access,
            guest: guest,
            is_allowed: guest.permissions["fields"][field_id][permission]
          })
        end
      end
    else
      guests.each do |guest|
        field_id = @field.id.to_s
        guest.permissions["fields"] = {} if guest.permissions["fields"] == nil
        guest.permissions["fields"][field_id] = {} if guest.permissions["fields"][field_id] == nil
        guest.permissions["fields"][field_id][permission] = default_value if guest.permissions["fields"][field_id][permission] == nil

        if guest.permissions["fields"][field_id][permission] != has_access
          @field.update_guests_access({
            permission: permission,
            access: access,
            guest: guest,
            is_allowed: guest.permissions["fields"][field_id][permission]
          })
        else
          @field.remove_guest(guest.id, permission)
        end
      end
    end

    allowed_guests = Array(@field.permissions[permission]["allowed_guests"])
    restricted_guests = Array(@field.permissions[permission]["restricted_guests"])

    @field.permissions[permission]["allowed_guests"] = allowed_guests.select {|guest_id| guests.any? {|guest| guest.id == guest_id} }
    @field.permissions[permission]["restricted_guests"] = restricted_guests.select {|guest_id| guests.any? {|guest| guest.id == guest_id} }
    @field.permissions[permission]["access"] = access
    @field.save
  end

  def update_allowed_roles!(permission, roles)
    permission = permission.underscore
    allowed_roles = Array(roles).select {|role| ROLES[role.to_sym] != nil}
    @field.permissions[permission]["allowed_roles"] = allowed_roles
    @field.save
  end
end
