module PusherHelper
  def pusher
    @pusher ||= Pusher::Client.new(
      app_id: '1277145',
      key: ENV["PUSHER_KEY"],
      secret: ENV["PUSHER_SECRET"],
      cluster: 'ap1',
      encrypted: true
    )
  end

  def pusher_trigger!(channel, event, body = {})
    pusher.trigger(channel, event, body)
  end
end