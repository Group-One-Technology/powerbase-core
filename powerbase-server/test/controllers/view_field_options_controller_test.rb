
require "controllers/application_controller_test"

class ViewFieldOptionsControllerTest < ApplicationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of fields of a given view" do
    view = table_views(:one)
    get view_view_fields_url(view_id: view.id)
    assert_response :success
  end
end
