if defined?(Rails::Server)
  # Destroy existing cron job to avoid duplicate
  Sidekiq::Cron::Job.destroy_all!

  notifications_job = Sidekiq::Cron::Job.new(
    name: "Read Notifications Cleanup",
    cron: '0 0 * * *', # Daily at 00:00
    class: 'NotificationsWorker'
  )

  if notifications_job.save
    notifications_job.enque!
    puts "Cleaning up read notifications..."
  else
    puts "Can't run read notifications cleanup cron job"
    raise job.errors
  end

  if ENV["ENABLE_LISTENER"] == "true"
    puts "** STARTING DATABASE AUTOSYNC AND LISTENERS **"
    ids = PowerbaseDatabase.turbo.postgresql.ids

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
  end
end