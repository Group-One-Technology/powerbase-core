
class TableIndexWorker < ApplicationWorker
  sidekiq_options lock: :until_and_while_executing,
                  on_conflict: { client: :log, server: :reject }

  def perform(table_id)
    super
    table = PowerbaseTable.find table_id
    table.reindex!
  end
end