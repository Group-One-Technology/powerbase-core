require "test_helper"

class PowerbaseDatabaseMigrationJobTest < ActiveJob::TestCase
  @@connection_string = "postgresql://postgres:postgres@localhost:5432/powerbase_test"

  test "that database's tables are migrated" do
    database = PowerbaseDatabase.new({
      name: "Powerbase Test",
      database_name: "powerbase_test",
      connection_string: @@connection_string,
      adapter: "postgresql",
      is_migrated: false,
      user_id: 1,
      color: "red",
      is_turbo: false,
    })
    assert database.save, "Could not save sample database"

    PowerbaseDatabaseMigrationJob.perform_later({
      database_id: database.id,
      adapter: database.adapter,
      connection_string: database.connection_string,
      is_turbo: database.is_turbo,
    })
    sleep 5

    db_database = PowerbaseDatabase.find(database.id)
    assert db_database.is_migrated, "Database couldn't be migrated"
  end
end
