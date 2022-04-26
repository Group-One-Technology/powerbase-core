class Guests::Updater
  include NotificationsHelper
  include DatabasePermissionsHelper
  include TablePermissionsHelper
  include FieldPermissionsHelper

  attr_accessor :guest, :errors

  def initialize(guest)
    @guest = guest
    @errors = nil
  end

  def accept_invite
    if @guest.update(is_accepted: true)
      create_notification!({
        data_type: "accept_invite",
        user_id: @guest.inviter_id,
        subject_id: @guest.user_id,
        message: "has accepted the invite to",
        object_type: 'database',
      }, @guest.powerbase_database)

      user = @guest.user
      user.update(is_onboarded: true) if !user.is_onboarded
      return true
    else
      @errors = @guest.errors
    end
  end

  def reject_invite
    database = @guest.powerbase_database
    notification = {
      data_type: "reject_invite",
      user_id: @guest.inviter_id,
      subject_id: @guest.user_id,
      message: "has rejected the invite to",
      object_type: 'database',
    }

    if self.remove_guest!
      create_notification!(notification, database)
      return true
    else
      @errors = @guest.errors
    end
  end

  def leave_base
    database = @guest.powerbase_database
    notification = {
      data_type: "leave_base",
      user_id: @guest.inviter_id,
      subject_id: @guest.user_id,
      message: "has left",
      object_type: 'database',
    }

    if self.remove_guest!
      create_notification!(notification, database)

      if @guest.inviter_id != database.user_id
        notification[:user_id] = database.user_id
        create_notification!(notification, database)
      end

      return true
    else
      @errors = @guest.errors
    end
  end

  def update_permissions!(permissions, filtered_permissions = nil)
    return if @guest.access != "custom"

    database = @guest.powerbase_database

    DATABASE_DEFAULT_PERMISSIONS.each do |key, value|
      permission_key = key.to_s

      # Check if permission didn't change
      next if permissions[permission_key] == nil
      next if permissions[permission_key] == @guest.permissions[permission_key]

      database.update_guests_access({
        permission: key,
        access: database.permissions[permission_key]["access"],
        guest: @guest,
        is_allowed: permissions[permission_key]
      })
    end

    permissions["tables"].each do |table_id, table_permissions|
      table = PowerbaseTable.find(table_id)

      TABLE_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        permission_table = table_id.to_s

        # Check if permission didn't change
        next if table_permissions[permission_key] == nil

        if @guest.permissions["tables"] && @guest.permissions["tables"][permission_table]
          next if table_permissions[permission_key] == @guest.permissions["tables"][permission_table][permission_key]
        end

        table.update_guests_access({
          permission: key,
          access: table.permissions[permission_key]["access"],
          guest: @guest,
          is_allowed: table_permissions[permission_key]
        })
      end
    end

    permissions["fields"].each do |field_id, field_permissions|
      field = PowerbaseField.find(field_id)

      FIELD_DEFAULT_PERMISSIONS.each do |key, value|
        permission_key = key.to_s
        permission_field = field_id.to_s

        # Check if permission didn't change
        next if field_permissions[permission_key] == nil

        if @guest.permissions["fields"] && @guest.permissions["fields"][permission_field]
          next if field_permissions[permission_key] == @guest.permissions["fields"][permission_field][permission_key]
        end

        field.update_guests_access({
          permission: key,
          access: field.permissions[permission_key]["access"],
          guest: @guest,
          is_allowed: field_permissions[permission_key]
        })
      end
    end

    @guest.update(permissions: filtered_permissions || permissions)
  end

  def update_field_permissions!(field_id, permissions)
    field = PowerbaseField.find(field_id)

    field_id_key = field_id.to_s

    if @guest.access == "custom"
      @guest.permissions["fields"] = {} if @guest.permissions["fields"] == nil
      @guest.permissions["fields"][field_id_key] = {} if @guest.permissions["fields"][field_id_key] == nil
    end

    permissions.each do |key, value|
      next if FIELD_DEFAULT_PERMISSIONS[key.to_sym] == nil
      next if ![true, false].include?(value)

      permission = key.to_s

      if @guest.access != "custom" && field.permissions[permission]["access"] != "specific users only"
        @guest.permissions = get_permissions(@guest)
        @guest.permissions["fields"] = {} if @guest.permissions["fields"] == nil
        @guest.permissions["fields"][field_id_key] = {} if @guest.permissions["fields"][field_id_key] == nil
        @guest.access = "custom" # ! TODO on change to custom, add user to restricted users in other fields -> changing from viewer -> custom
      end

      @guest.permissions["fields"][field_id_key][permission] = value if @guest.access == "custom"

      field.update_guest(@guest, permission, value)
    end

    @guest.permissions = nil if @guest.access != "custom"
    @guest.save
  end

  def update_table_permissions!(table_id, permissions)
    table = PowerbaseTable.find(table_id)

    table_id_key = table_id.to_s

    if @guest.access == "custom"
      @guest.permissions["tables"] = {} if @guest.permissions["tables"] == nil
      @guest.permissions["tables"][table_id_key] = {} if @guest.permissions["tables"][table_id_key] == nil
    end

    permissions.each do |key, value|
      next if TABLE_DEFAULT_PERMISSIONS[key.to_sym] == nil
      next if ![true, false].include?(value)

      permission = key.to_s

      if @guest.access != "custom" && table.permissions[permission]["access"] != "specific users only"
        @guest.permissions = get_permissions(@guest)
        @guest.permissions["tables"] = {} if @guest.permissions["tables"] == nil
        @guest.permissions["tables"][table_id_key] = {} if @guest.permissions["tables"][table_id_key] == nil
        @guest.access = "custom" # ! TODO on change to custom, add user to restricted users in other tables -> changing from viewer -> custom
      end

      @guest.permissions["tables"][table_id_key][permission] = value if @guest.access == "custom"

      table.update_guest(@guest, permission, value)
    end

    @guest.permissions = nil if @guest.access != "custom"
    @guest.save
  end

  def update_database_permissions!(permissions)
    database = @guest.powerbase_database

    @guest.permissions = {} if @guest.access == "custom" && @guest.permissions == nil

    permissions.each do |key, value|
      next if DATABASE_DEFAULT_PERMISSIONS[key.to_sym] == nil
      next if ![true, false].include?(value)

      permission = key.to_s

      if @guest.access != "custom" && database.permissions[permission]["access"] != "specific users only"
        @guest.permissions = get_permissions(@guest)
        @guest.access = "custom"
      end

      @guest.permissions[permission] = value if @guest.access == "custom"
      database.update_guest(@guest, permission, value)
    end

    @guest.permissions = nil if @guest.access != "custom"
    @guest.save
  end

  def update_access!(access)
    if @guest.access == "custom"
      remove_database_custom_guest(@guest)
      remove_table_custom_guest(@guest)
      remove_field_custom_guest(@guest)
      @guest.permissions = nil
    end

    if access == "custom"
      @guest.permissions = {
        view_base: true,
        tables: {},
        fields: {},
      }
    end

    @guest.access = access
    @guest.save
  end

  def remove_guest!
    RemoveGuestWorker.perform_async(@guest.id, @guest.powerbase_database_id, @guest.access)
    @guest.destroy
  end

  def object
    @guest
  end
end
