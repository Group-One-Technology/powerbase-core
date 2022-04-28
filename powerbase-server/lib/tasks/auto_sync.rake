namespace :database do
  task auto_sync: :environment do
    puts "#{Time.now} -- Enabling auto sync..."

    PowerbaseDatabase.each do |db|
      if db.postgresql?
        puts "#{Time.now} -- Enabling auto sync for Database - #{db.name}##{db.id}"

        notifier = Powerbase::Notifier.new db
        notifier.create_notifiers!

        puts "#{Time.now} -- Adding notifier to tables"

        db.actual_tables.find_each do|table|
          table.inject_notifier_triggers
        end
      end
    end
  end
end
