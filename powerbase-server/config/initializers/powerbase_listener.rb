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
    ids = PowerbaseDatabase.postgresql.ids

    if ids.length > 0
      listener_job = Sidekiq::Cron::Job.new(
        name: "Database Listeners",
        args: ids,
        cron: '*/5 * * * *', # Run The job every 5 mins
        class: 'PollWorker'
      )

      if listener_job.save
        listener_job.enque!
        puts "Powerbase Listening to #{ids.count} databases..."
      else
        puts "Can't run database listener cron job"
        raise listener_job.errors
      end

      syncer_job = Sidekiq::Cron::Job.new(
        name: "Database Syncer",
        args: ids,
        cron: '*/30 * * * *', # Run The job every 30 mins
        class: 'SyncerCronWorker'
      )

      if syncer_job.save
        syncer_job.enque!
        puts "Powerbase Syncing #{ids.count} databases..."
      else
        puts "Can't run database database syncer cron job"
        raise syncer_job.errors
      end

      non_turbo_bases_ids = PowerbaseDatabase.postgresql.where(is_turbo: false).ids
      non_turbo_base_syncer_job = Sidekiq::Cron::Job.new(
        name: "Non-turbo Database Deleted Records Syncer",
        args: non_turbo_bases_ids,
        cron: '0 0 * * FRI', # Run The job every Friday at 00:00
        class: 'NonTurboDbRecordsSyncerCronWorker'
      )

      if non_turbo_base_syncer_job.save
        non_turbo_base_syncer_job.enque!
        puts "Powerbase Syncing #{ids.count} non-turbo databases' deleted table records..."
      else
        puts "Can't run Non-turbo Database Deleted Records Syncer cron job"
        raise non_turbo_base_syncer_job.errors
      end
    end
  end
end