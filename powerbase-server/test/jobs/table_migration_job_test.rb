require "test_helper"

class TableMigrationJobTest < ActiveJob::TestCase
  @connection_string = "postgresql://postgres:postgres@localhost:5432/powerbase_test"

  test "that group's tables are migrated" do
    group = groups(:one)

    TableMigrationJob.perform_now(group.id, @connection_string)

    db_group = Group.find(group.id)
    assert db_group.is_migrated
  end
end
