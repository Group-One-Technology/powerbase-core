class SyncTableWorker < ApplicationWorker
  sidekiq_options lock: :until_and_while_executing,
                  on_conflict: { client: :log, server: :reject }

  def perform(table_id, new_connection, reindex = false)
    super

    table = PowerbaseTable.find table_id

    if !table
      puts "Could not find table with id of #{table_id}"
      return
    end

    if table.is_virtual
      puts "Table##{table_id} is a virtual table, it doesn't need to sync."
      return
    end

    table_syncer = Tables::Syncer.new table, new_connection: new_connection, reindex: reindex
    if !table_syncer.in_synced?
      table_syncer.sync!
    else
      puts "#{Time.now} -- Table with id of #{table_id} is already in synced."
    end
  end
end
