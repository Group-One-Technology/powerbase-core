class SyncTableWorker
  include Sidekiq::Worker

  def perform(table_id)
    table = PowerbaseTable.find table_id
    unmigrated_columns_count = table.unmigrated_columns.count

    if unmigrated_columns_count > 0
      table.unmigrated_columns.each do |column|
        # Create new column field
        field = Fields::Creator.new column, table
        field.save
      end

      table.reindex!
    end
  end
end