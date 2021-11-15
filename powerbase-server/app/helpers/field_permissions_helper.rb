module FieldPermissionsHelper
  include PermissionsHelper

  FIELD_DEFAULT_PERMISSIONS = {
    view_field: { access: "everyone", default_value: true },
    manage_field: { access: "admins and up", default_value: false },
    edit_field_data: { access: "editors and up", default_value: true },
  }

  def update_field_guests_access(field, permission, guest, is_allowed)
    permission_key = permission[0].to_s
    permission_value = permission[1]
    allowed_guests = Array(field.permissions[permission_key]["allowed_guests"])
    restricted_guests = Array(field.permissions[permission_key]["restricted_guests"])

    if is_allowed == true
      restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}
      allowed_guests.push(guest.id) if !does_custom_have_access(field.permissions[permission_key]["access"])
    else
      allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
      restricted_guests.push(guest.id) if does_custom_have_access(field.permissions[permission_key]["access"])
    end

    field.permissions[permission_key]["allowed_guests"] = allowed_guests.uniq
    field.permissions[permission_key]["restricted_guests"] = restricted_guests.uniq
    field.save
  end

  def remove_field_custom_guest(guest)
    return if guest.permissions == nil
    return if guest.permissions["fields"] == nil

    guest.permissions["fields"].each do |field_id, field_permissions|
      field = PowerbaseField.find(field_id)

      FIELD_DEFAULT_PERMISSIONS.each do |key, value|
        key = key.to_s
        next if field.permissions[key] == nil

        if field.permissions[key]["access"] != value[:access] || field_permissions[key] != value[:default_value]
          allowed_guests = Array(field.permissions[key]["allowed_guests"])
          allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
          restricted_guests = Array(field.permissions[key]["restricted_guests"])
          restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}

          field.permissions[key]["allowed_guests"] = allowed_guests.uniq
          field.permissions[key]["restricted_guests"] = restricted_guests.uniq
        end
      end

      field.save
    end
  end
end
