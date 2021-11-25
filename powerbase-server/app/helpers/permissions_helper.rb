module PermissionsHelper
  BASE_PERMISSIONS = [:view_base, :manage_base, :invite_guests, :change_guest_access, :remove_guests, :add_tables, :delete_tables]
  TABLE_PERMISSIONS = [:view_table, :manage_table, :manage_views, :add_views, :delete_views, :add_fields, :delete_fields, :add_records, :delete_records, :comment_records]
  FIELD_PERMISSIONS = [:view_field, :manage_field, :edit_field_data]
  PERMISSIONS = [*BASE_PERMISSIONS, *TABLE_PERMISSIONS, *FIELD_PERMISSIONS]

  ROLES = {
    :creator => [:all],
    :admin => [:view_base, *TABLE_PERMISSIONS, *FIELD_PERMISSIONS],
    :editor => [:view_base, :add_views, :manage_views, :view_table, :view_field, :add_records, :delete_records, :comment_records],
    :commenter => [:view_base, :view_table, :view_field, :comment_records],
    :viewer => [:view_base, :view_table, :view_field],
  }

  def does_guest_have_access(role, access)
    case access
    when "everyone"
      return true
    when "commenters and up"
      return role == "commenter" || role == "editor" || role == "custom" || role == "admin" || role == "creator"
    when "editors and up"
      return role == "editor" || role == "custom" || role == "admin" || role == "creator"
    when "admins and up"
      return role == "admin" || role == "creator"
    when "creators only"
      return role == "creator"
    else
      return false
    end
  end

  def get_permissions(guest)
    return guest.permissions if guest.custom?

    permissions = {
      view_base: true,
      view_table: true,
      view_field: true,
      tables: {},
      fields: {},
    }
    table_permissions = {}
    field_permissions = {}

    return permissions if guest.editor?

    if guest.creator?
      permissions[:invite_guests] = true
      permissions[:manage_base] = true
      permissions[:add_tables] = true
      permissions[:delete_tables] = true
    elsif guest.admin?
      permissions[:add_tables] = true
      permissions[:delete_tables] = true
    elsif guest.commenter?
      table_permissions = {
        add_views: false,
        manage_views: false,
        delete_views: false,
        add_records: false,
        delete_records: false,
      }

      field_permissions = {
        edit_field_data: false,
      }
    elsif guest.viewer?
      table_permissions = {
        add_views: false,
        manage_views: false,
        delete_views: false,
        add_records: false,
        delete_records: false,
        comment_records: false,
      }

      field_permissions = {
        edit_field_data: false,
      }
    end

    if guest.commenter? || guest.viewer?
      db = guest.powerbase_database
      tables = db.powerbase_tables

      tables.each do |table|
        permissions[:tables][table.id] = table_permissions

        fields = table.powerbase_fields
        fields.each do |field|
          permissions[:fields][field.id] = field_permissions
        end
      end
    end

    permissions
  end

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