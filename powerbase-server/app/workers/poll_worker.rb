
class PollWorker
  include Sidekiq::Worker

  attr_accessor :ids, :dbs

  def perform(*ids)
    @ids = ids
    @dbs = PowerbaseDatabase.where id: ids
    
    initialize_pg_listener!
    sync_db_and_tables!
  end

  def initialize_pg_listener!
    puts "Reinitializing listeners..."
    
    dbs.each do |db|
      if db.postgresql?
        if db.listener_thread.present?
          puts "Listener for #{db.thread_name} already exists"
          puts "Reseting #{db.thread_name} listener..."

          # Destroy Listiner thread
          Thread.list.delete(db.listener_thread)

          puts "Reseting #{db.thread_name} listener...DONE"
        else
          puts"Listening to #{db.thread_name}"
        end

        db.listen!
      end
    end
  end

  def sync_db_and_tables!
    puts "Autosync Database and Tables..."
    dbs.each do |db|
      db.sync!
      db.tables.each do |table|
        table.sync!
      end
    end
  end

end