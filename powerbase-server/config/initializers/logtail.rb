if ENV['LOGTAIL_SKIP_LOGS'].blank? && !Rails.env.test? || !Rails.env.development?
  http_device = Logtail::LogDevices::HTTP.new(ENV["LOGTAIL_SOURCE_TOKEN"])
  Rails.logger = Logtail::Logger.new(http_device)
else
  Rails.logger = Logtail::Logger.new(STDOUT)
end
