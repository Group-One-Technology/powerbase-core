class Guests::Updater
  include TablePermissionsHelper
  include FieldPermissionsHelper

  attr_accessor :guest

  def initialize(guest)
    @guest = guest
  end

  def update_permissions!(permissions, filtered_permissions = nil)
    return if @guest.access != "custom"

    permissions["tables"].each do |table_id, table_permissions|
      table = PowerbaseTable.find(table_id)

      TABLE_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        permission_table = table_id.to_s

        # Check if permission didn't change
        next if table_permissions[permission_key] == nil

        if @guest.permissions["tables"] && @guest.permissions["tables"][permission_table]
          next if table_permissions[permission_key] == @guest.permissions["tables"][permission_table][permission_key]
        end

        update_table_guests_access(table, [key, value], @guest, table_permissions[permission_key])
      end
    end

    permissions["fields"].each do |field_id, field_permissions|
      field = PowerbaseField.find(field_id)

      FIELD_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        permission_field = field_id.to_s

        # Check if permission didn't change
        next if field_permissions[permission_key] == nil

        if @guest.permissions["fields"] && @guest.permissions["fields"][permission_field]
          next if field_permissions[permission_key] == @guest.permissions["fields"][permission_field][permission_key]
        end

        field.update_guests_access({
          permission: key,
          access: field.permissions[permission_key]["access"],
          guest: @guest,
          is_allowed: field_permissions[permission_key]
        })
      end
    end

    @guest.update(permissions: filtered_permissions || permissions)
  end

  def update_field_permissions!(field_id, permissions)
    if @guest.access != "custom"
      @guest.permissions = get_permissions(@guest)
      @guest.access = "custom"
    end

    field = PowerbaseField.find(field_id)

    field_id_key = field_id.to_s
    @guest.permissions["fields"] = {} if @guest.permissions["fields"] == nil
    @guest.permissions["fields"][field_id_key] = {} if @guest.permissions["fields"][field_id_key] == nil

    permissions.each do |key, value|
      next if FIELD_DEFAULT_PERMISSIONS[key.to_sym] == nil
      next if ![true, false].include?(value)

      permission = key.to_s
      @guest.permissions["fields"][field_id_key][permission] = value
      field.update_guest(@guest, permission, value)
    end

    @guest.save
  end

  def update_access!(access)
    if @guest.access == "custom"
      remove_table_custom_guest(@guest)
      remove_field_custom_guest(@guest)
      @guest.permissions = nil
    end

    if access == "custom"
      @guest.permissions = {
        view_base: true,
        view_table: true,
        view_field: true,
        tables: {},
        fields: {},
      }
    end

    @guest.access = access
    @guest.save
  end

  def remove_guest!
    RemoveGuestWorker.perform_async(@guest.id, @guest.powerbase_database_id, @guest.access)
    @guest.destroy
  end

  def object
    @guest
  end
end
