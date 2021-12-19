class TableConnectionsWorker
  include Sidekiq::Worker

  def perform(table_id)
    table = PowerbaseTable.find table_id
    table.migrator.create_base_connection!
  end
end