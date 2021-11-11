module TablePermissionsHelper
  DEFAULT_PERMISSIONS = {
    view_table: { access: "everyone", default_value: true },
    manage_table: { access: "admins and up", default_value: false },
    add_fields: { access: "admins and up", default_value: false },
    delete_fields: { access: "admins and up", default_value: false },
    add_views: { access: "editors and up", default_value: true },
    manage_views: { access: "editors and up", default_value: true },
    delete_views: { access: "editors and up", default_value: true },
    add_records: { access: "editors and up", default_value: true },
    delete_records: { access: "editors and up", default_value: true },
    comment_records: { access: "commenters and up", default_value: true },
  }

  def update_table_guests_access(table, permission, guest, is_allowed)
    permission_key = permission[0].to_s
    permission_value = permission[1]
    allowed_guests = Array(table.permissions[permission_key]["allowed_guests"])
    restricted_guests = Array(table.permissions[permission_key]["restricted_guests"])

    if is_allowed == true
      restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}
      allowed_guests.push(guest.id) if !does_custom_have_access(table.permissions[permission_key]["access"])
    else
      allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
      restricted_guests.push(guest.id) if does_custom_have_access(table.permissions[permission_key]["access"])
    end

    table.permissions[permission_key]["allowed_guests"] = allowed_guests.uniq
    table.permissions[permission_key]["restricted_guests"] = restricted_guests.uniq
    table.save
  end

  def remove_table_custom_guest(guest)
    return if guest.permissions == nil
    return if guest.permissions["tables"] == nil

    guest.permissions["tables"].each do |table_id, table_permissions|
      table = PowerbaseTable.find(table_id)

      DEFAULT_PERMISSIONS.each do |key, value|
        key = key.to_s
        next if table.permissions[key] == nil

        if table.permissions[key]["access"] != value[:access] || table_permissions[key] != value[:default_value]
          allowed_guests = Array(table.permissions[key]["allowed_guests"])
          allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
          restricted_guests = Array(table.permissions[key]["restricted_guests"])
          restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}

          table.permissions[key]["allowed_guests"] = allowed_guests.uniq
          table.permissions[key]["restricted_guests"] = restricted_guests.uniq
        end
      end

      table.save
    end
  end
end
