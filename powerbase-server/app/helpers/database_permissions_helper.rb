module DatabasePermissionsHelper
  include PermissionsHelper

  DATABASE_DEFAULT_PERMISSIONS = {
    view_base: { access: "everyone", default_value: true },
    manage_base: { access: "creators only", default_value: false },
    invite_guests: { access: "creators only", default_value: false },
    add_tables: { access: "admins and up", default_value: false },
    delete_tables: { access: "admins and up", default_value: false },
  }

  def remove_database_custom_guest(guest)
    return if guest.permissions == nil

    database = guest.powerbase_database

    DATABASE_DEFAULT_PERMISSIONS.each do |key, value|
      key = key.to_s
      next if database.permissions[key] == nil

      if database.permissions[key]["access"] != value[:access] || guest.permissions[key] != value[:default_value]
        allowed_guests = Array(database.permissions[key]["allowed_guests"])
        allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
        restricted_guests = Array(database.permissions[key]["restricted_guests"])
        restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}

        database.permissions[key]["allowed_guests"] = allowed_guests.uniq
        database.permissions[key]["restricted_guests"] = restricted_guests.uniq
      end
    end

    database.save
  end
end
