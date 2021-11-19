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

        update_field_guests_access(field, [key, value], @guest, field_permissions[permission_key])
      end
    end

    @guest.update(permissions: filtered_permissions || permissions)
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
      }
    end

    @guest.access = access
    @guest.save
  end

  def remove_guest!
    remove_table_custom_guest(@guest)
    remove_field_custom_guest(@guest)
    @guest.destroy
  end

  def object
    @guest
  end
end