require "test_helper"

class PiiTest < ActiveSupport::TestCase
  test "should save pii with valid data" do
    pii = piis(:one)
    assert pii.save, "Could not save the pii with valid data"
  end

  test "should not save pii without required fields" do
    pii = Pii.new
    assert_not pii.save, "Saved the pii without required fields"
  end
end
