include PusherHelper

class SyncDatabaseWorker < ApplicationWorker
  attr_accessor :database, :new_connection, :in_synced

  def perform(database_id, new_connection = false)
    super

    @new_connection = new_connection
    set_database(database_id)
    initialize_sync_database
  end

  def on_complete(status, params)
    puts "#{Time.now} -- Migrating batch for database##{params["database_id"]} has #{status.failures} failures" if status.failures != 0

    set_database(params["database_id"])

    if params["step"] == "migrating_metadata"
      return add_connections
    elsif params["step"] == "adding_connections" && ENV["ENABLE_LISTENER"] == "true" && database.postgresql?
      return create_listeners
    elsif params["step"] != "indexing_records" && database.is_turbo
      return index_records
    end

    database.tables.each do |table|
      table.write_migration_logs!(status: "migrated")
    end

    database.update_status!("migrated")
    database.base_migration.end_time = Time.now
    database.base_migration.save

    pusher_trigger!("database.#{database.id}", "migration-listener", { id: database.id })

    listen!
  end

  private
    def set_database(database_id)
      @database = PowerbaseDatabase.find database_id

      if !@database
        puts "Could not find database with id of '#{database_id}'"
        return
      end
    end

    def initialize_sync_database
      db_syncer = Databases::Syncer.new database, new_connection: new_connection

      if db_syncer.in_synced?
        puts "#{Time.now} -- Database with id of #{database.id} is already in synced."
        return
      end

      database.update_status!("migrating_metadata")

      batch = Sidekiq::Batch.new
      batch.description = "Migrating metadata for db##{database.id}"
      batch.on(:complete, SyncDatabaseWorker,
        :database_id => database.id,
        :new_connection => new_connection,
        :step => "migrating_metadata",
      )
      batch.jobs do
        db_syncer.sync!
      end

      puts "#{Time.now} -- Started Batch #{batch.bid} - Migrating metadata for db##{database.id}"
    end

    def add_connections
      database.update_status!("adding_connections")

      batch = Sidekiq::Batch.new
      batch.description = "Adding and auto linking connections for db##{database.id}"
      batch.on(:complete, SyncDatabaseWorker,
        :database_id => database.id,
        :new_connection => new_connection,
        :step => "adding_connections",
      )
      batch.jobs do
        database.tables.each do |table|
          table.migrator.create_base_connection_later!
        end
      end

      puts "#{Time.now} -- Started Batch #{batch.bid} -- Adding and auto linking connections for db##{database.id}"
    end

    def create_listeners
      database.update_status!("creating_listeners")
      database.create_notifier_function! if new_connection

      batch = Sidekiq::Batch.new
      batch.description = "Creating listeners for database##{database.id}"
      batch.on(:complete, SyncDatabaseWorker,
        :database_id => database.id,
        :new_connection => new_connection,
        :step => "creating_listeners",
      )
      batch.jobs do
        database.tables.each {|table| table.migrator.create_listener_later!}
      end

      puts "#{Time.now} -- Started Batch #{batch.bid} -- Creating listeners for database##{database.id}"
    end

    def index_records
      database.update_status!("indexing_records")

      batch = Sidekiq::Batch.new
      batch.description = " for database##{database.id}"
      batch.on(:complete, SyncDatabaseWorker,
        :database_id => database.id,
        :new_connection => new_connection,
        :step => "indexing_records",
      )
      batch.jobs do
        database.tables.each(&:reindex_later!)
      end

      puts "#{Time.now} -- Started Batch #{batch.bid} -- Indexing records for database##{database.id}"
    end

    def listen!
      if new_connection
        poller = Sidekiq::Cron::Job.find("Database Listeners")
        poller.args << database.id
        poller.save
      end
    end
end
