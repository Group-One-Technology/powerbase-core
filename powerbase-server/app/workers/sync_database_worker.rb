class SyncDatabaseWorker
  include Sidekiq::Worker

  attr_accessor :database, :unmigrated_tables, :deleted_tables

  def perform(database_id)
    @database = PowerbaseDatabase.find database_id
    
    unless database.in_synced?
      @unmigrated_tables = @database.unmigrated_tables
      @deleted_tables = @database.deleted_tables

      puts "Migrating unmigrated tables of database with id of #{@database.id}..."
  
      if unmigrated_tables.any?
        table_creators = []
        unmigrated_tables.each_with_index do |table_name, index|
          table = Tables::Creator.new table_name, index + 1, database
          table.save
          table_view = TableViews::Creator.new table.object
          table_view.save
          table.object.default_view_id = table_view.object.id
          table.object.sync!
          table_creators << table
        end

        table_creators.each(&:create_base_connection!)
      end

      if deleted_tables.any?
        deleted_tables.each do |table|
          table.default_view_id = nil
          table.save
          table.destroy
        end
      end
    end
  end
end