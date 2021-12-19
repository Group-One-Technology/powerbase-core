class AddMigratedStatusToTables < ActiveRecord::Migration[6.1]
  def up
    tables = PowerbaseTable.all

    tables.each do |table|
      if !table.is_migrated
        table.logs["migration"]["status"] = "migrated"
        table.save
      end
    end
  end

  def down
    tables = PowerbaseTable.all

    tables.each do |table|
      table.logs["migration"]["status"] = nil
      table.save
    end
  end
end
