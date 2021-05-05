require "test_helper"

class PowerbaseFieldTypeTest < ActiveSupport::TestCase
  test "should save field type with valid data" do
    field_type = powerbase_field_types(:one)
    assert field_type.save, "Could not save the field type with valid data"
  end

  test "should not save field type without required fields" do
    field_type = PowerbaseFieldType.new
    assert_not field_type.save, "Saved the type field without required fields"
  end
end
