if defined?(Rails::Server) && ENV["ENABLE_LISTENER"]
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
    raise "Can't run database listener cron job"
    raise job.errors
  end

end