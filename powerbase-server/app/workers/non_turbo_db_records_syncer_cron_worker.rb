class NonTurboDbRecordsSyncerCronWorker < ApplicationWorker
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
    @dbs = PowerbaseDatabase.where id: ids, is_turbo: false

    initialize_sync_tables!
  end

  def initialize_sync_tables!
    puts "#{Time.now} Autosync Table Records..."
    dbs.each do |db|
      db.actual_tables.each do |table|
        table_syncer = Tables::Syncer.new table
        table_syncer.sync!
      end
    end
  end
end