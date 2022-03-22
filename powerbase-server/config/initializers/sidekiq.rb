Sidekiq.configure_server do |config|
  config.client_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Client
  end

  config.server_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Server
  end

  config.death_handlers << ->(job, ex) do
    puts "Uh oh, #{job["class"]} #{job["jid"]} just died with error #{ex.message}."
    Sentry.set_context("job_info", job)
    Sentry.capture_exception(ex)
  end

  SidekiqUniqueJobs::Server.configure(config)
end

Sidekiq.configure_client do |config|
  config.client_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Client
  end
end
