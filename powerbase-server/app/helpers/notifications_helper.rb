module NotificationsHelper
  include PusherHelper

  def create_notification!(data, object)
    notification = Notification.create!({
      data_type: data[:data_type],
      message: data[:message],
      object: object,
      subject_id: data[:subject_id],
      user_id: data[:user_id]
    })

    begin
      notif_pusher_trigger!(notification.user_id, notification.data_type)
    rescue => ex
      puts ex
    end
  end

  def notif_pusher_trigger!(user_id, type)
    begin
      pusher_trigger!("notifications.#{user_id}", "notifications-listener", { type: type })
    rescue => ex
      puts ex
    end
  end
end