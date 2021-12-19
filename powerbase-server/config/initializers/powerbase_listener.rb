if defined?(Rails::Server) && ENV["ENABLE_LISTENER"] == "true"
  puts "** STARTING DATABASE AUTOSYNC AND LISTENERS **"
  ids = PowerbaseDatabase.turbo.select(&:has_row_oid_support?).map(&:id)

  # Destroy existing cron job to avoid duplicate
  Sidekiq::Cron::Job.destroy_all!

  job = Sidekiq::Cron::Job.new(
    name: "Database Listeners",
    args: ids,
    cron: '*/5 * * * *', # Run The job every 5 mins
    class: 'PollWorker'
  )

  if job.save
    job.enque!
    puts "Powerbase Listening to #{ids.count} turbo databases..."
  else
    puts "Can't run database listener cron job"
    raise job.errors
  end

  notifications_job = Sidekiq::Cron::Job.new(
    name: "Read Notifications Cleanup",
    cron: '0 0 * * *', # Daily at 00:00
    class: 'PollWorker'
  )

  if notifications_job.save
    notifications_job.enque!
    puts "Cleaning up a read notifications..."
  else
    puts "Can't run read notifications cleanup cron job"
    raise job.errors
  end
end