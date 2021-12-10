class SyncTableWorker
  include Sidekiq::Worker
  include PusherHelper

  attr_accessor :table, :database

  def perform(table_id, reindex)
    @table = PowerbaseTable.find table_id
    @database = table.db
    unmigrated_columns = table.unmigrated_columns
    deleted_columns = table.deleted_columns

    unless table.in_synced?
      if unmigrated_columns.any?
        puts "Unmigrated column detected at table##{table.id}..."
        puts "Saving #{unmigrated_columns.count} additional column(s)..."

        unmigrated_columns.each do |column|
          # Create field
          field = Fields::Creator.new column, table
          field.save
        end
      end

      if deleted_columns.any?
        puts "Deleted column(s) detected at table##{table.id}..."
        puts "Removing #{deleted_columns.count} column(s)..."

        deleted_columns.each do |field|
          field.view_field_options.destroy_all
          field.destroy
        end
      end

      table.reindex! if reindex
    end
  end
end