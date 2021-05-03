require "test_helper"

class GroupTest < ActiveSupport::TestCase
  test "should save group with valid data" do
    group = groups(:one)
    assert group.save, "Could not save the group with valid data"
  end

  test "should not save group without required fields" do
    group = Group.new
    assert_not group.save, "Saved the group without required fields"
  end
end
