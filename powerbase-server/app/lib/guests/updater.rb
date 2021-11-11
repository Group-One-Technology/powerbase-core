class Guests::Updater
  include TablePermissionsHelper

  attr_accessor :guest

  def initialize(guest)
    @guest = guest
  end

  def update_permissions!(permissions)
    return if @guest.access != "custom"

    permissions["tables"].each do |table_id, table_permissions|
      table = PowerbaseTable.find(table_id)

      DEFAULT_PERMISSIONS.each do |key, value|
        # Check if permission didn't change
        next if table_permissions[key.to_s] == nil
        next if table_permissions[key.to_s] == @guest.permissions["tables"][table_id.to_s][key.to_s]

        update_table_guests_access(table, [key, value], @guest, table_permissions[key.to_s])
      end
    end

    @guest.update(permissions: permissions)
  end

  def update_access!(access)
    if @guest.access == "custom"
      remove_table_custom_guest(@guest)
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
    @guest.destroy
  end

  def object
    @guest
  end
end
