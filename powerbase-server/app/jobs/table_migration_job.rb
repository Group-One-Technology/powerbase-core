class TableMigrationJob < ApplicationJob
  queue_as :default

  def perform(group_id, connection_string)
    db = Powerbase.connect({ connection_string: connection_string })

    db.tables.each do |table_name|
      table = PowerTable.new
      table.name = table_name
      table.group_id = group_id
      table.save
    end

    group = Group.find(group_id)
    group.update(is_migrated: true)
  end
end
