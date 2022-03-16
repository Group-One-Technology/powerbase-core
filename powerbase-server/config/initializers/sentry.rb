if ENV["ENABLE_SENTRY"] == "true" || Rails.env.production?
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN"]
    config.breadcrumbs_logger = [:active_support_logger, :http_logger]
    config.rails.report_rescued_exceptions = true
  end
end
