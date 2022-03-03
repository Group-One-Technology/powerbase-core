Sidekiq.configure_server do |config|
  config.death_handlers << ->(job, ex) do
    puts "Uh oh, #{job["class"]} #{job["jid"]} just died with error #{ex.message}."
    Sentry.set_context("job_info", job)
    Sentry.capture_exception(exception)
  end
end
