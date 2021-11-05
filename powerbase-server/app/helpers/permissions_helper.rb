module PermissionsHelper
  BASE_PERMISSIONS = [:view_base, :manage_base, :invite_guests, :change_guest_access, :remove_guests, :add_tables]
  TABLE_PERMISSIONS = [:view_table, :manage_table, :add_views, :add_fields, :add_records, :delete_records, :comment_records]
  FIELD_PERMISSIONS = [:view_field, :manage_field, :edit_field_data]
  VIEW_PERMISSIONS = [:see_view, :manage_view]
  PERMISSIONS = [*BASE_PERMISSIONS, *TABLE_PERMISSIONS, *FIELD_PERMISSIONS, *VIEW_PERMISSIONS]

  ROLES = {
    :owner => [:all],
    :admin => [:view_base, *TABLE_PERMISSIONS, *FIELD_PERMISSIONS, *VIEW_PERMISSIONS],
    :editor => [:view_base, :add_views, *VIEW_PERMISSIONS, :view_table, :view_field, :see_view, :add_records, :delete_records, :comment_records],
    :commenter => [:view_base, :view_table, :view_field, :see_view, :comment_records],
    :viewer => [:view_base, :view_table, :view_field, :see_view],
  }

  class NotFound < StandardError
    def message
      "Could not find resource."
    end
  end
  class AccessDenied < StandardError
    def message
      "You are not authorized to perform this action."
    end
  end

  # * Checks whether the current user has access to the ff:
  # Accepts the following options:
  # :permission :: a given ability to check whether the current_user can do or not.
  # :resource :: the resource to check the given permission against.
  # :guest :: (optional) the guest object or guest_id
  def can?(permission, resource, guest = nil)
    resource_type = nil
    database = nil

    if BASE_PERMISSIONS.include?(permission)
      resource_type = :database
      if !resource.is_a?(ActiveRecord::Base)
        database = PowerbaseDatabase.find(resource)
        raise NotFound.new("Could not database with id of #{resource}.") if !database
      else
        database = resource
      end
    elsif TABLE_PERMISSIONS.include?(permission)
      resource_type = :table
      if !resource.is_a?(ActiveRecord::Base)
        table = PowerbaseTable.find(resource)
        raise NotFound.new("Could not table with id of #{resource}.") if !table
      else
        table = resource
      end

      database = table.powerbase_database
    elsif FIELD_PERMISSIONS.include?(permission)
      resource_type = :field
      if !resource.is_a?(ActiveRecord::Base)
        field = PowerbaseField.find(resource)
        raise NotFound.new("Could not field with id of #{resource}.") if !field
      else
        field = resource
      end

      database = field.powerbase_table.powerbase_database
    elsif VIEW_PERMISSIONS.include?(permission)
      resource_type = :view
      if !resource.is_a?(ActiveRecord::Base)
        view = TableView.find(resource)
        raise NotFound.new("Could not view with id of #{resource}.") if !view
      else
        view = resource
      end

      database = view.powerbase_table.powerbase_database
    end

    return true if database.user_id == current_user.id

    guest = Guest.find(guest) if !database.is_a?(ActiveRecord::Base)
    guest = guest || Guest.find_by(user_id: current_user.id, powerbase_database_id: database.id)
    raise AccessDenied if !guest

    if guest.access.to_sym != :custom
      permissions = ROLES[guest.access.to_sym]
      return true if permissions.include?(:all)
      return true if permissions.include? permission
    else
      # TODO: Add custom permissions checker
      # - Pass the database_id/table_id/view_id for checking.
    end

    raise AccessDenied
  end
end