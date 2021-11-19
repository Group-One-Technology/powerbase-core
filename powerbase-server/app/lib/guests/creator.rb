class Guests::Creator
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
    })
  end

  def update_custom_permissions
    return if @guest.access != "custom"

    @guest.permissions["tables"].each do |table_id, table_permissions|
      table = PowerbaseTable.find(table_id)

      TABLE_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        next if table_permissions[permission_key] == nil

        if table.permissions[permission_key]["access"] != value[:access] || table_permissions[permission_key] != value[:default_value]
          update_table_guests_access(table, [key, value], @guest, table_permissions[permission_key])
        end
      end
    end

    @guest.permissions["fields"].each do |field_id, field_permissions|
      field = PowerbaseField.find(field_id)

      FIELD_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        next if field_permissions[permission_key] == nil

        if field.permissions[permission_key]["access"] != value[:access] || field_permissions[permission_key] != value[:default_value]
          update_field_guests_access(field, [key, value], @guest, field_permissions[permission_key])
        end
      end
    end
  end

  def object
    @guest
  end

  def save
    @guest.save && update_custom_permissions
  end
end