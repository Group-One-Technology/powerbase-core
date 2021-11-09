namespace :database do
  task auto_sync: :environment do 
    puts "Enabling auto sync.."

    PowerbaseDatabase.turbo.each do |db|
      if db.postgresql?
        puts "Enabling auto sync for Database - #{db.name}##{db.id}"

        notifier = Powerbase::Notifier.new db
        notifier.create_notifier!

        puts " -- Adding notifier to tables"

        db.tables.find_each do|table|
          # Add oid
          table.inject_oid if db.has_row_oid_support?

          # Inject notifier trigger
          table.inject_notifier_trigger
        end
      end
    end
  end
end