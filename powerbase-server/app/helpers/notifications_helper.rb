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

  def notif_pusher_trigger!(user_id, type)
    pusher_trigger!("notifications.#{user_id}", "notifications-listener", { type: type })
  end
end