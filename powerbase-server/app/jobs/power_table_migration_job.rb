class PowerTableMigrationJob < ApplicationJob
  queue_as :default

  def perform(database_id, connection_string)
    db = Powerbase.connect({ connection_string: connection_string })

    db.tables.each do |table_name|
      table = PowerTable.new
      table.name = table_name
      table.powerbase_database_id = database_id
      table.save
    end

    database = PowerbaseDatabase.find(database_id)
    database.update(is_migrated: true)
  end
end
