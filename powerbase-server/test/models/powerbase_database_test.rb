require "test_helper"

class PowerbaseDatabaseTest < ActiveSupport::TestCase
  test "should save database with valid data" do
    database = powerbase_databases(:one)
    assert database.save, "Could not save the database with valid data"
  end

  test "should not save database without required fields" do
    database = PowerbaseDatabase.new
    assert_not database.save, "Saved the database without required fields"
  end
end
