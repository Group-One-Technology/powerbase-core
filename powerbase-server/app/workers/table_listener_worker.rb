class TableListenerWorker
  include Sidekiq::Worker

  def perform(table_id)
    table = PowerbaseTable.find table_id

    if table.db.postgresql? && ENV["ENABLE_LISTENER"] == "true"
      table.write_migration_logs!(status: "injecting_notifier")
      table.inject_notifier_trigger
      table.inject_event_notifier_trigger
      table.write_migration_logs!(status: "notifiers_created")
    end
  end
end
