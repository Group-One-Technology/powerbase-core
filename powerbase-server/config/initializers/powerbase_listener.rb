
if defined? Rails::Server
  ids = PowerbaseDatabase.turbo.ids
  
  # Destroy existing cron job to avoid duplicate
  Sidekiq::Cron::Job.destroy_all!
  
  job = Sidekiq::Cron::Job.new(
    name: "Database Listeners",
    args: ids,
    cron: '*/5 * * * *',
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