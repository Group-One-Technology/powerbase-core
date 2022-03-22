class SyncerCronWorker < ApplicationWorker
  attr_accessor :ids, :dbs

  sidekiq_options lock: :until_executing,
                  on_conflict: { client: :log, server: :reject }

  def perform(*ids)
    super

    if ids.count == 0
      puts "#{Time.now} -- Could not sync database with no given ids."
      return
    end

    @ids = ids
    @dbs = PowerbaseDatabase.where id: ids

    initialize_sync_db_and_tables!
  end

  def initialize_sync_db_and_tables!
    puts "#{Time.now} Autosync Database and Tables..."
    dbs.each(&:sync!)
  end
end