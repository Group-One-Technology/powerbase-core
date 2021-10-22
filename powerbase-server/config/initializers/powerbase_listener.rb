
if defined? Rails::Server
  ids = PowerbaseDatabase.turbo.ids
  job = Sidekiq::Cron::Job.new(
    name: "Database Listeners",
    args: ids,
    cron: '*/1 * * * *',
    class: 'PollWorker'
  )

  job.save

  puts "Powerbase Listening to #{ids.count} turbo databases..."
end