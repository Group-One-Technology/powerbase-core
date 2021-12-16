class TableListenerWorker
  include Sidekiq::Worker

  def perform(table_id)
    table = PowerbaseTable.find table_id
    table.create_listener!
  end
end
