require "test_helper"

class BaseConnectionTest < ActiveSupport::TestCase
  test "should save base connection with valid data" do
    connections = base_connections(:one)
    assert connections.save, "Could not save the base connection with valid data"
  end

  test "should not save base connection without required fields" do
    connections = BaseConnection.new
    assert_not connections.save, "Saved the base connection without required fields"
  end
end
