class SyncerCronWorker
    include Sidekiq::Worker

    attr_accessor :ids, :dbs

    def perform(*ids)
        @ids = ids
        @dbs = PowerbaseDatabase.where id: ids


        initialize_sync_db_and_tables!
    end

    def initialize_sync_db_and_tables!
        puts "Autosync Database and Tables..."
        dbs.each do |db|
            db.sync!
            # db.tables.each(&:sync!)
        end
    end
end