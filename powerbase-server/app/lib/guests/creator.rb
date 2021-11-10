class Guests::Creator
  DEFAULT_PERMISSIONS = {
    view_table: { access: "everyone", default_value: true },
    manage_table: { access: "admin and up", default_value: false },
    add_fields: { access: "admin and up", default_value: false },
    delete_fields: { access: "admin and up", default_value: false },
    add_views: { access: "editors and up", default_value: true },
    manage_views: { access: "editors and up", default_value: true },
    delete_views: { access: "editors and up", default_value: true },
    add_records: { access: "editors and up", default_value: true },
    delete_records: { access: "editors and up", default_value: true },
    comment_records: { access: "commenters and up", default_value: true },
  }

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
        if table_permissions[key.to_s] != value[:default_value]
          table.permissions[key.to_s]["access"] = "specific users only"

          allowed_users = Array(table.permissions[key.to_s]["users"])
          allowed_users.push(@guest.id)

          allowed_roles = Array(table.permissions[key.to_s]["roles"])
          allowed_roles = ["owners"] if allowed_roles.length == 0

          case value[:access]
          when "everyone"
            existing_guests = @guest.powerbase_database.guests
            existing_guests.each do |existing_guest|
              if @guest.access != "owner"
                allowed_users.push(existing_guest.id)
              end
            end
          when "admin and up"
            allowed_roles.push("admin")
          when "editors and up"
            allowed_roles.push("admin")
            allowed_roles.push("editor")
          when "commenters and up"
            allowed_roles.push("admin")
            allowed_roles.push("editor")
            allowed_roles.push("commenter")
          else
            allowed_users.push("admin")
            allowed_users.push("editor")
            allowed_users.push("commenter")
            allowed_users.push("viewer")
          end

          table.permissions[key.to_s]["users"] = allowed_users.uniq
          table.permissions[key.to_s]["roles"] = allowed_roles.uniq
        end


        table.save
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
