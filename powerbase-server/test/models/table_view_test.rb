require "test_helper"

class TableViewTest < ActiveSupport::TestCase
  test "should save table view with valid data" do
    view = table_views(:one)
    assert view.save, "Could not save the table view with valid data"
  end

  test "should not save table view without required fields" do
    view = TableView.new
    assert_not view.save, "Saved the table view without required fields"
  end
end
