require "test_helper"

class FieldSelectOptionTest < ActiveSupport::TestCase
  test "should save field select options with valid data" do
    options = field_select_options(:one)
    assert options.save, "Could not save the field select options with valid data"
  end

  test "should not save field select options without required fields" do
    options = FieldSelectOption.new
    assert_not options.save, "Saved the field select options without required fields"
  end
end
