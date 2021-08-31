require "controllers/application_controller_test"

class FieldSelectOptionsControllerTest < ApplicationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of select options of a given field" do
    field = powerbase_fields(:six)
    get field_select_options_url(field_id: field.id)
    assert_response :success
  end
end
