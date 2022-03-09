class SyncDatabaseWorker
  include Sidekiq::Worker
  include PusherHelper

  attr_accessor :database, :unmigrated_tables, :deleted_tables, :new_connection

  def perform(database_id, new_connection = false)
    return if cancelled?

    @database = PowerbaseDatabase.find database_id
    @new_connection = new_connection

    if database.in_synced?
      puts "#{Time.now} -- SyncDatabaseWorker #{database.name} is already in synced!"
    else
      @unmigrated_tables = @database.unmigrated_tables
      @deleted_tables = @database.deleted_tables

      puts "#{Time.now} Migrating unmigrated tables of database with id of #{@database.id}..."

      if unmigrated_tables.any?
        batch = Sidekiq::Batch.new
        batch.description = "#{Time.now} Migrating metadata of database with id of #{database.id}"
        batch.on(:complete, SyncDatabaseWorker, :database_id => database.id, :step => "migrating_metadata", :new_connection => new_connection)
        batch.jobs do
          unmigrated_tables.each_with_index do |table_name, index|
            table = Tables::Creator.new table_name, index + 1, database
            table.save

            # Migrate fields and records
            table.sync!(false)
          end
        end

        puts "#{Time.now} Started Batch #{batch.bid}"
      end

      if deleted_tables.any?
        deleted_tables.each do |table|
          table.remove
        end
      end
    end
  end

  def on_complete(status, params)
    puts "#{Time.now} Migrating batch for database##{params["database_id"]} has #{status.failures} failures" if status.failures != 0

    @database = PowerbaseDatabase.find params["database_id"]
    @new_connection = params["new_connection"]

    return add_connections if params["step"] == "migrating_metadata"

    if params["step"] == "adding_connections"
      if ENV["ENABLE_LISTENER"] == "true" && database.postgresql?
        return create_listeners
      end
    end

    if database.is_turbo
      return index_records if params["step"] != "indexing_records"
    else
      database.tables.each do |table|
        table.write_migration_logs!(status: "migrated")
      end
    end

    database.update_status!("migrated")
    database.base_migration.end_time = Time.now
    database.base_migration.save

    pusher_trigger!("database.#{database.id}", "migration-listener", { id: database.id })
  end

  def cancelled?
    Sidekiq.redis {|c| c.exists("cancelled-#{jid}") }
  end

  def self.cancel!(jid)
    Sidekiq.redis {|c| c.setex("cancelled-#{jid}", 86400, 1) }
  end

  private
    def add_connections
      database.update_status!("adding_connections")

      batch = Sidekiq::Batch.new
      batch.description = "Adding and auto linking connections for database##{database.id}"
      batch.on(:complete, SyncDatabaseWorker, :database_id => database.id, :step => "adding_connections", :new_connection => new_connection)
      batch.jobs do
        database.tables.each do |table|
          table.migrator.create_base_connection_later!
        end
      end

      puts "#{Time.now} Started Batch #{batch.bid}"
    end

    def create_listeners
      return if ENV["ENABLE_LISTENER"] != "true" || !database.postgresql?

      database.update_status!("creating_listeners")
      database.create_notifier_function! if new_connection

      database.update_status!("adding_connections")

      batch = Sidekiq::Batch.new
      batch.description = "Creating listeners for database##{database.id}"
      batch.on(:complete, SyncDatabaseWorker, :database_id => database.id, :step => "creating_listeners", :new_connection => new_connection)
      batch.jobs do
        database.tables.each {|table| table.migrator.create_listener_later!}
      end

      puts "#{Time.now} Started Batch #{batch.bid}"

      if new_connection && database.is_turbo
        poller = Sidekiq::Cron::Job.find("Database Listeners")
        poller.args << database.id
        poller.save
      end
    end

    def index_records
      database.update_status!("indexing_records")

      batch = Sidekiq::Batch.new
      batch.description = "Indexing records for database##{database.id}"
      batch.on(:complete, SyncDatabaseWorker, :database_id => database.id, :step => "indexing_records", :new_connection => new_connection)
      batch.jobs do
        database.tables.each(&:reindex_later!)
      end

      puts "#{Time.now} Started Batch #{batch.bid}"
    end
end
