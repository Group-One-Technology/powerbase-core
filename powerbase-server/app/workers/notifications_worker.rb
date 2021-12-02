class NotificationsWorker
  include Sidekiq::Worker

  def perform
    Notifications.where(has_read: true, created_at: 1.day.ago).destroy_all
  end
end
