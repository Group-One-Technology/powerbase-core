include SequelHelper
include PusherHelper

class SyncDatabaseWorker < ApplicationWorker
  attr_accessor :database, :new_connection, :in_synced

  sidekiq_options lock: :until_executing,
                  on_conflict: { client: :log, server: :reject }

  def perform(database_id, new_connection = false)
    super

    @new_connection = new_connection
    set_database(database_id)

    begin
      if database.is_created && new_connection
        create_listeners
        set_database_as_migrated
      else
        initialize_sync_database
      end
    rescue => ex
      puts "#{Time.now} -- An error occurred for database##{database_id}, a #{new_connection ? "new connection" : "syncing error"}"
      puts ex
    end
  end

  def on_complete(status, params)
    if status != nil && status.failures != 0
      error_message = "#{Time.now} -- Migrating batch for database##{params["database_id"]} has #{status.failures} failures"
      puts error_message
      Sentry.capture_message(error_message)
    end

    set_database(params["database_id"])
    @new_connection = params["new_connection"]

    if database.status == "migrated"
      puts "#{Time.now} -- Database##{database.id} has been migrated"
      pusher_trigger!("database.#{database.id}", "migration-listener", { id: database.id })
      return
    elsif database.status == "migrating_metadata"
      return add_connections
    elsif database.status == "adding_connections" && ENV["ENABLE_LISTENER"] == "true" && database.postgresql?
      return create_listeners
    elsif database.status != "indexing_records" && database.is_turbo
      return index_records
    end

    database.actual_tables.each do |table|
      table.write_migration_logs!(status: "migrated")
    end

    set_database_as_migrated
  end

  private
    def set_database(database_id)
      if database_id == nil
        puts "#{Time.now} -- Could not sync database with no given id."
        return
      end

      @database = PowerbaseDatabase.find database_id

      if !@database
        puts "Could not find database with id of '#{database_id}'"
        return
      end
    end

    def set_database_as_migrated
      database.update_status!("migrated")
      database.base_migration.end_time = Time.now
      database.base_migration.save

      puts "#{Time.now} -- Database##{database.id} has been migrated"
      pusher_trigger!("database.#{database.id}", "migration-listener", { id: database.id })

      listen!
    end

    def initialize_sync_database
      db_syncer = Databases::Syncer.new database, new_connection: new_connection

      if db_syncer.in_synced?
        puts "#{Time.now} -- No unmigrated/dropped tables detected for db##{database.id}. Now checking tables if in synced."

        # Re-checking tables if in-synced
        unsynced_table_schemas = {}
        unsynced_table_keys = {}
        tables = database.actual_tables
        tables.each do |table|
          puts "#{Time.now} -- Checking if table##{table.id} is in synced for db##{database.id}"
          table_name = table.name.to_sym

          begin
            table_schema = sequel_connect(database) {|db| db.schema(table_name)}
            table_foreign_keys = sequel_connect(database) {|db| db.foreign_key_list(table_name)}
          rescue Sequel::Error => ex
            if ex.message.include?("schema parsing returned no columns")
              table_schema = []
            else
              raise ex
            end
          end

          table_syncer = Tables::Syncer.new table, schema: table_schema, foreign_keys: table_foreign_keys
          if !table_syncer.in_synced?
            unsynced_table_schemas[table_name] = table_schema
            unsynced_table_keys[table_name] = table_foreign_keys
          end
        end

        if unsynced_table_schemas.length > 0
          puts "#{Time.now} -- Re-migrating #{unsynced_table_schemas.count} unsynced metadata for db##{database.id}."
          batch = Sidekiq::Batch.new
          batch.description = "Re-migrating metadata for db##{database.id}"
          batch.on(:complete, SyncDatabaseWorker,
            :database_id => database.id,
            :new_connection => new_connection,
          )
          batch.jobs do
            unsynced_table_schemas.each do |table_name, table_schema|
              table = tables.find {|table| table.name.to_sym == table_name}
              table_syncer = Tables::Syncer.new table, schema: table_schema, foreign_keys: unsynced_table_keys[table_name]
              table_syncer.sync!
            end
          end
        end

        if database.status == "migrated"
          puts "#{Time.now} -- Database with id of #{database.id} is already in synced."
          return
        end
        return on_complete(nil, ({ new_connection: new_connection }).to_json)
      end

      database.update_status!("migrating_metadata")

      batch = Sidekiq::Batch.new
      batch.description = "Migrating metadata for db##{database.id}"
      batch.on(:complete, SyncDatabaseWorker,
        :database_id => database.id,
        :new_connection => new_connection,
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

      if new_connection
        database.create_notifier_function!
        return if database.is_created
      end

      batch = Sidekiq::Batch.new
      batch.description = "Creating listeners for database##{database.id}"
      batch.on(:complete, SyncDatabaseWorker,
        :database_id => database.id,
        :new_connection => new_connection,
      )
      batch.jobs do
        database.actual_tables.each {|table| table.migrator.create_listener_later!}
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
      )
      batch.jobs do
        database.actual_tables.each(&:reindex_later!)
      end

      puts "#{Time.now} -- Started Batch #{batch.bid} -- Indexing records for database##{database.id}"
    end

    def listen!
      if new_connection
        poller = Sidekiq::Cron::Job.find("Database Listeners")

        if poller
          poller.args << database.id
        else
          poller = Sidekiq::Cron::Job.new(
            name: "Database Listeners",
            args: [database.id],
            cron: '*/5 * * * *', # Run The job every 5 mins
            class: 'PollWorker'
          )
        end

        if poller.save
          poller.enque!
          puts "Powerbase Listening to database##{database.id}..."
        else
          puts "Can't run database listener cron job"
          raise poller.errors
        end
      end
    end
end
