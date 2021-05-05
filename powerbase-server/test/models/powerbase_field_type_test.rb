require "test_helper"

class PowerbaseFieldTypeTest < ActiveSupport::TestCase
  test "should save field type with valid data" do
    field = powerbase_field_types(:one)
    assert field.save, "Could not save the field with valid data"
  end

  test "should not save field without required fields" do
    field = PowerbaseFieldType.new
    assert_not field.save, "Saved the field without required fields"
  end
end
