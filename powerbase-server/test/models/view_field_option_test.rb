require "test_helper"

class ViewFieldOptionTest < ActiveSupport::TestCase
  test "should save view field option with valid data" do
    view_field = view_field_options(:one)
    assert view_field.save, "Could not save the view field option with valid data"
  end

  test "should not save view field option without required fields" do
    view_field = ViewFieldOption.new
    assert_not view_field.save, "Saved the view field option without required fields"
  end
end
