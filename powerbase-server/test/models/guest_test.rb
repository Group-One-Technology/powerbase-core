require "test_helper"

class GuestTest < ActiveSupport::TestCase
  test "should save guest with valid data" do
    guest = guests(:one)
    assert guest.save, "Could not save guest with valid data"
  end

  test "should not save guest without required fields" do
    guest = Guest.new
    assert_not guest.save, "Saved the guest without required fields"
  end
end
