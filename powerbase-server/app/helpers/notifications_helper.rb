module NotificationsHelper
  include PusherHelper

  def create_notification!(data, object)
    Notification.create!({
      data_type: data[:data_type],
      message: data[:message],
      object: data[:object_type],
      subject_id: data[:subject_id],
      user_id: data[:user_id]
    })

    notif_pusher_trigger!(notification.user_id, notification.data_type)
  end

  def notif_pusher_trigger!(user_id, type)
    pusher_trigger!("notifications.#{user_id}", "notifications-listener", { type: type })
  end
end