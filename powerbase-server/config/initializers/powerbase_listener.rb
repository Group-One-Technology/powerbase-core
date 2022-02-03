if Rails.env.production? || defined?(Rails::Server)
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

    listener_job = Sidekiq::Cron::Job.new(
      name: "Database Listeners",
      args: ids,
      cron: '*/5 * * * *', # Run The job every 5 mins
      class: 'PollWorker'
    )

    if listener_job.save
      listener_job.enque!
      puts "Powerbase Listening to #{ids.count} turbo databases..."
    else
      puts "Can't run database listener cron job"
      raise listener_job.errors
    end

    syncer_job = Sidekiq::Cron::Job.new(
      name: "Database Syncer",
      args: ids,
      cron: '*/15 * * * *', # Run The job every 5 mins
      class: 'SyncerCronWorker'
    )

    if syncer_job.save
      syncer_job.enque!
      puts "Powerbase Syncing #{ids.count} turbo databases..."
    else
      puts "Can't run database database syncer cron job"
      raise syncer_job.errors
    end
  end
end