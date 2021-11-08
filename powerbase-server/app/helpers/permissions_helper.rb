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
end