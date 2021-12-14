class SyncDatabaseWorker
  include Sidekiq::Worker

  attr_accessor :database, :unmigrated_tables, :deleted_tables

  def perform(database_id, new_connection = false)
    @database = PowerbaseDatabase.find database_id
    @base_migration = @database.base_migration

    unless database.in_synced?
      @unmigrated_tables = @database.unmigrated_tables
      @deleted_tables = @database.deleted_tables

      puts "Migrating unmigrated tables of database with id of #{@database.id}..."

      if new_connection && database.postgresql?
        database.create_notifier_function!
      end

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
            # Index record to elasticsearch if on turbo
            table.object.sync!(database.is_turbo)
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
    puts "Uh oh, batch has failures" if status.failures != 0

    @database = PowerbaseDatabase.find params["database_id"]
    @database.update_status!("adding_connections")

    @database.tables.each do |table|
      table.migrator.create_base_connection!
    end

    if params["new_connection"] && database.is_turbo && ENV["ENABLE_LISTENER"]
      poller = Sidekiq::Cron::Job.find("Database Listeners")
      poller.args << database.id
      poller.save
    end
  end
end