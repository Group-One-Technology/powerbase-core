require "test_helper"

class PowerbaseTableTest < ActiveSupport::TestCase
  test "should save table with valid data" do
    table = powerbase_tables(:one)
    assert table.save, "Could not save the table with valid data"
  end

  test "should not save table without required fields" do
    table = PowerbaseTable.new
    assert_not table.save, "Saved the table without required fields"
  end
end
