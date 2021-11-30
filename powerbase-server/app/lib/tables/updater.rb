class Tables::Updater
  include PermissionsHelper
  include TablePermissionsHelper

  attr_accessor :table

  def initialize(table)
    @table = table
  end

  def update_access!(permission, access)
    return if (permission == access)

    permission = permission.underscore
    default_access = TABLE_DEFAULT_PERMISSIONS[permission.to_sym][:access]
    default_value = TABLE_DEFAULT_PERMISSIONS[permission.to_sym][:default_value]
    guests = Guest.where(access: "custom", powerbase_database_id: @table.powerbase_database_id)
    has_access = does_guest_have_access("custom", access)

    if access == default_access
      guests.each do |guest|
        table_id = @table.id.to_s
        guest.permissions["tables"] = {} if guest.permissions["tables"] == nil
        guest.permissions["tables"][table_id] = {} if guest.permissions["tables"][table_id] == nil
        guest.permissions["tables"][table_id][permission] = default_value if guest.permissions["tables"][table_id][permission] == nil

        if guest.permissions["tables"][table_id][permission] == default_value
          @table.remove_guest(guest.id, permission)
        else
          @table.update_guests_access({
            permission: permission,
            access: access,
            guest: guest,
            is_allowed: guest.permissions["tables"][table_id][permission]
          })
        end
      end
    else
      guests.each do |guest|
        table_id = @table.id.to_s
        guest.permissions["tables"] = {} if guest.permissions["tables"] == nil
        guest.permissions["tables"][table_id] = {} if guest.permissions["tables"][table_id] == nil
        guest.permissions["tables"][table_id][permission] = default_value if guest.permissions["tables"][table_id][permission] == nil

        if guest.permissions["tables"][table_id][permission] != has_access
          @table.update_guests_access({
            permission: permission,
            access: access,
            guest: guest,
            is_allowed: guest.permissions["tables"][table_id][permission]
          })
        else
          @table.remove_guest(guest.id, permission)
        end
      end
    end

    allowed_guests = Array(@table.permissions[permission]["allowed_guests"])
    restricted_guests = Array(@table.permissions[permission]["restricted_guests"])

    @table.permissions[permission]["allowed_guests"] = allowed_guests.select {|guest_id| guests.any? {|guest| guest.id == guest_id} }
    @table.permissions[permission]["restricted_guests"] = restricted_guests.select {|guest_id| guests.any? {|guest| guest.id == guest_id} }
    @table.permissions[permission]["access"] = access
    @table.save
  end

  def update_allowed_roles!(permission, roles)
    permission = permission.underscore
    allowed_roles = Array(roles).select {|role| ROLES[role.to_sym] != nil}
    @table.permissions[permission]["allowed_roles"] = allowed_roles
    @table.save
  end
end
