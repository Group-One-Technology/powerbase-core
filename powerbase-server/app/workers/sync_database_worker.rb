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

      if new_connection
        notifier = Powerbase::Notifier.new database
        notifier.create_notifier!
      end
  
      if unmigrated_tables.any?
        table_creators = []
        unmigrated_tables.each_with_index do |table_name, index|
          table = Tables::Creator.new table_name, index + 1, database
          # Save table ojbect
          table.save

          # Create table view
          table_view = TableViews::Creator.new table.object
          table_view.save
          
          # Assign default view
          table.object.default_view_id = table_view.object.id
          table.object.save

          # Migrate fields and records
          table.object.sync!
          table_creators << table
        end

        # Create base connection / auto link
        table_creators.each(&:create_base_connection!)
      end

      if deleted_tables.any?
        deleted_tables.each do |table|
          table.remove
        end
      end
      
      if new_connection
        @base_migration.end_time = Time.now
        @base_migration.save
        
        poller = Sidekiq::Cron::Job.find("Database Listeners")
        poller.args << database.id
        poller.save
      end
    end
  end
end