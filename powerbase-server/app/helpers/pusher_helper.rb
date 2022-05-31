module PusherHelper
  def pusher
    if !ENV["PUSHER_URL"].to_s.empty?
      @pusher = Pusher::Client.from_env
      return @pusher
    end

    scheme = ""
    host = ""
    port = ""

    if !ENV["PUSHER_HOST"].to_s.empty?
      scheme, host = ENV["PUSHER_HOST"].split("://")
      host, port = host.split(":")
    end

    config = !scheme.empty? && !host.empty? && !port.empty? ? {
        host: host,
        port: port,
        scheme: scheme,
        use_tls: false,
        enabled_transports: ["ws", "wss"],
      } : { cluster: 'ap1', use_tls: true }

    @pusher ||= Pusher::Client.new(
      app_id: ENV["PUSHER_APP_ID"],
      key: ENV["PUSHER_KEY"],
      secret: ENV["PUSHER_SECRET"],

      **config
    )
  end

  def pusher_trigger!(channel, event, body = {})
    pusher.trigger(channel, event, body)
  end
end