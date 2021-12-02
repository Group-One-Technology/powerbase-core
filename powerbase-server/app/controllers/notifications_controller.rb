class NotificationsController < ApplicationController
  before_action :authorize_access_request!

  # GET /notifications
  def index
    render json: current_user.notifications.map {|item| format_json(current_user, item)}
  end

  # PUT /notifications/read
  def read
    Notification.where(user_id: current_user.id, has_read: false).update_all(has_read: true)
    render status: :no_content
  end

  private
    def format_json(user, notification)
      {
        id: notification.id,
        data_type: notification.data_type,
        message: notification.message,
        user_id: notification.user_id,
        user: user_format_json(user),
        subject: user_format_json(notification.subject),
        object: notification.object,
        has_read: notification.has_read,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
      }
    end

    def user_format_json(user)
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: "#{user.first_name} #{user.last_name}",
        email: user.email,
      }
    end
end
