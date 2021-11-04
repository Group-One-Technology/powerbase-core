module PermissionsHelper
  BASE_PERMISSIONS = [:view_base, :manage_base, :invite_guests, :change_guest_access, :remove_guests]
  TABLE_PERMISSIONS = [:view_table, :manage_table, :add_records, :delete_records, :comment_records]
  FIELD_PERMISSIONS = [:view_field, :manage_field, :edit_field_data]
  VIEW_PERMISSIONS = [:see_view, :manage_view]

  ROLES = {
    :owner => [:all],
    :admin => [:view_base, *TABLE_PERMISSIONS, *FIELD_PERMISSIONS, *VIEW_PERMISSIONS],
    :editor => [:view_base, *VIEW_PERMISSIONS, :view_table, :view_field, :see_view],
    :commenter => [:view_base, :view_table, :view_field, :see_view, :comment_records],
    :viewer => [:view_base, :view_table, :view_field, :see_view],
  }

  class NotFound < StandardError; end
  class AccessDenied < StandardError
    def message
      "You are not authorized to perform this action."
    end
  end

  # * Checks whether the current user has access to the ff:
  # Accepts the following options:
  # :permission :: a given ability to check whether the current_user can do or not.
  # :database :: the database check the given permission against.
  def can?(permission, database, guest = nil)
    if !database.is_a?(ActiveRecord::Base)
      database = PowerbaseDatabase.find(database)
      raise NotFound.new("Could not find database with id of #{id}") if !database
    end

    return true if database.user_id == current_user.id

    guest = Guest.find(guest) if !database.is_a?(ActiveRecord::Base)
    guest = guest || Guest.find_by(user_id: current_user.id, powerbase_database_id: database.id)
    raise AccessDenied if !guest

    if guest.access.to_sym != :custom
      permissions = ROLES[guest.access.to_sym]
      return true if permissions.include?(:all)
      return true if permissions.include? permission
    end

    raise AccessDenied
  end

  # * Retrieves the current_user's permissions (object/hash)
  def get_permissions(database_id)
    database = PowerbaseDatabase.find(id)
    raise NotFound.new("Could not find database with id of #{id}") if !database
    return { :all => true } if database.user_id == current_user.id

    guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: database_id)
    raise AccessDenied if !guest

    if guest.access.to_sym != :custom
      permissions = {}
      ROLES[guest.access.to_sym].each do |permission|
        permissions[permission] = true
      end
      permissions
    else
      guest.permissions
    end
  end
end