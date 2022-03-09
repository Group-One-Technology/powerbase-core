module PusherHelper
  def pusher
    @pusher ||= Pusher::Client.new(
      app_id: ENV["PUSHER_APP_ID"],
      key: ENV["PUSHER_KEY"],
      secret: ENV["PUSHER_SECRET"],
      cluster: 'ap1',
      use_tls: true
    )
  end

  def pusher_trigger!(channel, event, body = {})
    pusher.trigger(channel, event, body)
  end
end