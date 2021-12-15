class SyncDatabaseWorker
  include Sidekiq::Worker
  include PusherHelper

  attr_accessor :database, :unmigrated_tables, :deleted_tables

  def perform(database_id, new_connection = false)
    @database = PowerbaseDatabase.find database_id
    @base_migration = @database.base_migration

    unless database.in_synced?
      @unmigrated_tables = @database.unmigrated_tables
      @deleted_tables = @database.deleted_tables

      puts "Migrating unmigrated tables of database with id of #{@database.id}..."

      if unmigrated_tables.any?
        batch = Sidekiq::Batch.new
        batch.description = "Migrating metadata of database with id of #{database_id}"
        batch.on(:complete, SyncDatabaseWorker, :database_id => database_id, :new_connection => new_connection)
        batch.jobs do
          unmigrated_tables.each_with_index do |table_name, index|
            table = Tables::Creator.new table_name, index + 1, database
            # Save table object
            table.save

            # Create table view
            table_view = TableViews::Creator.new table.object
            table_view.save

            # Assign default view
            table.object.default_view_id = table_view.object.id
            table.object.save

            # Migrate fields and records
            table.object.sync!(false)
          end
        end

        puts "Started Batch #{batch.bid}"
      end

      if deleted_tables.any?
        deleted_tables.each do |table|
          table.remove
        end
      end
    end
  end

  def on_complete(status, params)
    puts "Migrating batch for database##{params["database_id"]} has #{status.failures} failures" if status.failures != 0

    @database = PowerbaseDatabase.find params["database_id"]

    add_connections
    create_listeners(params["new_connection"])

    if !database.is_turbo && !database.is_migrating?
      database.is_migrated = true
      database.save
      base_migration.end_time = Time.now
      base_migration.save

      pusher_trigger!("database.#{database.id}", "migration-listener", database)
    end

    index_records if database.is_turbo
    database.update_status!("migrated") if !database.is_migrating?
  end

  private
    def add_connections
      database.update_status!("adding_connections")
      database.tables.each do |table|
        table.migrator.create_base_connection!
      end
    end

    def create_listeners(new_connection = false)
      if database.postgresql?
        database.update_status!("creating_listeners")
        database.create_notifier_function! if new_connection

        if ENV["ENABLE_LISTENER"]
          database.tables.each do |table|
            if database.has_row_oid_support?
              table.logs["migration"]["status"] = "injecting_oid"
              table.save
              pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)

              table.inject_oid
            end

            table.logs["migration"]["status"] = "injecting_notifier"
            table.save
            pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)

            table.inject_notifier_trigger

            table.logs["migration"]["status"] = "notifiers_created"
            table.save
            pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)
          end
        end
      end

      if new_connection && database.is_turbo && ENV["ENABLE_LISTENER"]
        poller = Sidekiq::Cron::Job.find("Database Listeners")
        poller.args << database.id
        poller.save
      end
    end

    def index_records
      database.update_status!("indexing_records")
      database.tables.each(&:reindex!)
    end
end