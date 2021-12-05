class InviteGuestWorker
  include Sidekiq::Worker
  include NotificationsHelper
  include TablePermissionsHelper
  include FieldPermissionsHelper

  def perform(guest_id)
    guest = Guest.find guest_id

    return unless guest.custom?

    db = guest.powerbase_database
    db.powerbase_tables.each do |table|
      table_key = table.id.to_s

      # Check for non-default permissions access for tables
      TABLE_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        has_permission_value = guest.permissions["tables"] && guest.permissions["tables"][table_key] && guest.permissions["tables"][table_key][permission_key] != nil
        next if has_permission_value

        table_access = table.permissions[permission_key]["access"]

        if table_access != value[:access]
          table.update_guests_access({
            permission: key,
            access: table_access,
            guest: guest,
            is_allowed: value[:default_value]
          })
        end
      end

      fields = PowerbaseField.where(powerbase_table_id: table.id)
      fields.each do |field|
        field_key = field.id.to_s

        # Check for non-default permissions access for fields
        FIELD_DEFAULT_PERMISSIONS.each do |key, value|
          permission_key = key.to_s
          has_permission_value = guest.permissions["fields"] && guest.permissions["fields"][field_key] && guest.permissions["fields"][field_key][permission_key] != nil
          next if has_permission_value

          field_access = field.permissions[permission_key]["access"]

          if field_access != value[:access]
            field.update_guests_access({
              permission: key,
              access: field_access,
              guest: guest,
              is_allowed: value[:default_value]
            })
          end
        end
      end
    end

    guest.is_synced = true
    guest.save

    # Notify changes to client
    notif_pusher_trigger!(guest.user_id, "base_invite", guest)
  end
end