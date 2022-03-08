namespace :database do
  task auto_sync: :environment do
    puts "#{Time.now} -- Enabling auto sync..."

    PowerbaseDatabase.turbo.each do |db|
      if db.postgresql?
        puts "#{Time.now} -- Enabling auto sync for Database - #{db.name}##{db.id}"

        notifier = Powerbase::Notifier.new db
        notifier.create_notifier!
        notifier.create_event_notifier! if db.is_superuser

        puts "#{Time.now} -- Adding notifier to tables"

        db.tables.find_each do|table|
          table.inject_notifier_trigger
          table.inject_event_notifier_trigger if db.is_superuser
        end
      end
    end
  end
end