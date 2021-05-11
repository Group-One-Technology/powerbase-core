require "test_helper"

class TableForeignKeyTest < ActiveSupport::TestCase
  test "should save table foreign key with valid data" do
    foreign_keys = table_foreign_keys(:one)
    assert foreign_keys.save, "Could not save the table foreign key with valid data"
  end

  test "should not save table foreign key without required fields" do
    foreign_keys = TableForeignKey.new
    assert_not foreign_keys.save, "Saved the table foreign key without required fields"
  end
end
