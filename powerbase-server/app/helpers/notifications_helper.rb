module NotificationsHelper
  include PusherHelper

  def create_notification!(data, object)
    notification = Notification.create!({
      data_type: data[:data_type],
      message: data[:message],
      object: object_format_json(data[:object_type], object),
      subject_id: data[:subject_id],
      user_id: data[:user_id]
    })

    notif_pusher_trigger!(notification.user_id, notification.data_type, notification)
  end

  def notif_pusher_trigger!(user_id, type, data)
    payload = if type == "base_invite"
      {
        type: type,
        data: guest_format_json(data) # data = guest
      }
    else
      {
        type: type,
        data: data # data = notification
      }
    end

    # Notify changes to client
    pusher_trigger!("notifications.#{user_id}", "notifications-listener", payload)
  end

  private
    def object_format_json(type, object)
      if type == "database"
        owner = object.user

        {
          type: "database",
          id: object.id,
          name: object.name,
          owner_id: object.user_id,
          owner: {
            user_id: owner.id,
            first_name: owner.first_name,
            last_name: owner.last_name,
            name: "#{owner.first_name} #{owner.last_name}",
            email: owner.email
          }
        }
      else
        object
      end
    end

    def guest_format_json(guest)
      user = guest.user
      inviter = guest.inviter

      {
        id: guest.id,
        access: guest.access,
        permissions: guest.permissions,
        user_id: guest.user_id,
        user: {
            id: guest.id,
            access: guest.access,
            permissions: guest.permissions,
            user_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            name: "#{user.first_name} #{user.last_name}",
            email: user.email,
            is_accepted: guest.is_accepted,
            is_synced: guest.is_synced,
        },
        inviter_id: guest.inviter_id,
        inviter: {
          id: inviter.id,
          first_name: inviter.first_name,
          last_name: inviter.last_name,
          name: "#{inviter.first_name} #{inviter.last_name}",
          email: inviter.email,
        },
        database_id: guest.powerbase_database_id,
        database_name: guest.powerbase_database.name,
        is_accepted: guest.is_accepted,
        is_synced: guest.is_synced,
      }
    end
end