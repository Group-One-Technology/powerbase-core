require "test_helper"

class FieldDbTypeMappingTest < ActiveSupport::TestCase
  test "should save field_db_type_mapping with valid data" do
    mapping = field_db_type_mappings(:one)
    assert mapping.save, "Could not save the field_db_type_mapping with valid data"
  end

  test "should not save field_db_type_mapping without required fields" do
    mapping = FieldDbTypeMapping.new
    assert_not mapping.save, "Saved the field_db_type_mapping without required fields"
  end
end
