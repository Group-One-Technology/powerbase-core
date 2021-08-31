require "controllers/application_controller_test"

class PowerbaseFieldTypesControllerTest < ApplicationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of field types" do
    get field_types_url()
    assert_response :success
  end
end
