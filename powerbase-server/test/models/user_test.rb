require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "should save user with valid data" do
    user = users(:one)
    assert user.save, "Could not save the table with valid data"
  end

  test "should not save user without required fields" do
    user = User.new
    assert_not user.save, "Saved the table without required fields"
  end
end