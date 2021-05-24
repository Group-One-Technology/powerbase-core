require "controllers/application_controller_test"

class LoginControllerTest < ApplcationControllerTest
  setup do
    login
    request.cookies[:jwt_access] = cookies[:jwt_access]
    request.headers["X-CSRF-TOKEN"] = JSON.parse(response.body)["csrf"]
  end

  test "should be able to login" do
    assert_response :success
    assert cookies[:jwt_access], "JWT Access Cookie could not be saved."
    assert JSON.parse(response.body)["csrf"], "CSRF token is missing in the response."
  end

  test "should be able to logout" do
    logout
    assert_response :success
  end
end
