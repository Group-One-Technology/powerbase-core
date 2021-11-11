class Guests::Creator
  include TablePermissionsHelper

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

      DEFAULT_PERMISSIONS.each do |key, value|
        if table.permissions[key.to_s]["access"] != value[:access] || table_permissions[key.to_s] != value[:default_value]
          update_table_guests_access(table, [key, value], @guest, table_permissions[key.to_s])
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
