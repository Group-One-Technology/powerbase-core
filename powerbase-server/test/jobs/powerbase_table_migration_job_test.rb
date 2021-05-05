require "test_helper"

class PowerbaseTableMigrationJobTest < ActiveJob::TestCase
  @connection_string = "postgresql://postgres:postgres@localhost:5432/powerbase_test"

  test "that database's tables are migrated" do
    database = powerbase_databases(:one)

    PowerbaseTableMigrationJob.perform_now(database.id, @connection_string)

    db_database = PowerbaseDatabase.find(database.id)
    assert db_database.is_migrated
  end
end
