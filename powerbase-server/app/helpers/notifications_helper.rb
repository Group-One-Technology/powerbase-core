module NotificationsHelper
  include PusherHelper

  def notif_pusher_trigger!(user_id, type, data)
    payload = if "base-invite"
      {
        type: "base-invite",
        data: guest_format_json(data)
      }
    # else other notification types
    end

    # Notify changes to client
    pusher_trigger!("notifications.#{user_id}", "notifications-listener", payload)
  end

  private
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