namespace :database do
  task :auto_sync do
    puts "Enabling auto sync.."

    poller = Sidekiq::Cron::Job.find("Database Listeners")

    PowerbaseDatabase.turbo.each do |db|
      puts "Enabling auto sync for Database - #{db.name}##{db.id}"

      notifier = Powerbase::Notifier.new db
      notifier.create_notifier!

      puts " -- Adding notifier to tables"

      db.tables.each do|table|
        # Add oid
        table.inject_oid if db.has_row_oid_support?

        # Inject notifier trigger
        table.inject_notifier_trigger
      end


      puts " -- Add db to poller"
      poller.args << db.id
    end
    
    poller.save
    poller.enque!
  end
end