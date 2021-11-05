require "test_helper"

class BaseMigrationTest < ActiveSupport::TestCase
  test "should save base migration with valid data" do
    base_migration = base_migrations(:one)
    assert base_migration.save, "Could not save the base migration with valid data"
  end

  test "should not save base migration without required fields" do
    base_migration = BaseMigration.new
    assert_not base_migration.save, "Saved the fbase migration without required fields"
  end
end
