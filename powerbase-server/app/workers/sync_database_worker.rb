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
      add_connections
    elsif params["step"] == "adding_connections" && ENV["ENABLE_LISTENER"] == "true" && database.postgresql?
      puts "SHOULD CREATE LISTENERS NOW."
    elsif params["step"] != "indexing_records"
      if database.is_turbo
        puts "INDEXING RECORDS NOW."
      else
        database.tables.each do |table|
          table.write_migration_logs!(status: "migrated")
        end
      end
    end
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

    def listen!
      listener_job = Sidekiq::Cron::Job.new(
        name: "Database #{database.id} Listener",
        args: [database.id],
        cron: '*/5 * * * *', # Run The job every 5 mins
        class: 'PollWorker'
      )

      if listener_job.save
        listener_job.enque!
        puts "#{Time.now} -- Powerbase listening to database##{database.id}..."
      else
        puts "#{Time.now} -- Can't run database listener cron job"
        raise listener_job.errors
      end
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
