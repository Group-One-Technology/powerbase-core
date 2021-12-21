class Guests::Creator
  include NotificationsHelper
  include DatabasePermissionsHelper
  include TablePermissionsHelper
  include FieldPermissionsHelper

  attr_accessor :guest

  def initialize(params)
    @guest = Guest.new({
      user_id: params[:user_id],
      powerbase_database_id: params[:powerbase_database_id],
      access: params[:access],
      permissions: params[:permissions],
      inviter_id: params[:inviter_id],
      is_accepted: params[:is_accepted],
      is_synced: params[:access] != "custom"
    })
  end

  def update_custom_permissions
    unless @guest.custom?
      # Notify changes to client
      notif_pusher_trigger!(guest.user_id, "base_invite", @guest) if @guest.powerbase_database_id.to_s != ENV["SAMPLE_DATABASE_ID"]
      return true
    end

    database = @guest.powerbase_database

    DATABASE_DEFAULT_PERMISSIONS.each do |key, value|
      permission_key = key.to_s
      next if @guest.permissions[permission_key] == nil
      database_access = database.permissions[permission_key]["access"]

      if database_access != value[:access] || @guest.permissions[permission_key] != value[:default_value]
        database.update_guests_access({
          permission: key,
          access: database_access,
          guest: @guest,
          is_allowed: @guest.permissions[permission_key]
        })
      end
    end

    @guest.permissions["tables"].each do |table_id, table_permissions|
      table = PowerbaseTable.find(table_id)

      TABLE_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        next if table_permissions[permission_key] == nil
        table_access = table.permissions[permission_key]["access"]

        if table_access != value[:access] || table_permissions[permission_key] != value[:default_value]
          table.update_guests_access({
            permission: key,
            access: table_access,
            guest: @guest,
            is_allowed: table_permissions[permission_key]
          })
        end
      end
    end

    @guest.permissions["fields"].each do |field_id, field_permissions|
      field = PowerbaseField.find(field_id)

      FIELD_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        next if field_permissions[permission_key] == nil
        field_access = field.permissions[permission_key]["access"]

        if field_access != value[:access] || field_permissions[permission_key] != value[:default_value]
          field.update_guests_access({
            permission: key,
            access: field_access,
            guest: @guest,
            is_allowed: field_permissions[permission_key]
          })
        end
      end
    end

    InviteGuestWorker.perform_async(@guest.id)
  end

  def object
    @guest
  end

  def save
    @guest.save && update_custom_permissions
  end
end
