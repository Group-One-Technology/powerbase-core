require "controllers/application_controller_test"

class LoginControllerTest < ApplicationControllerTest
  test "should be able to login" do
    login
    assert cookies[:jwt_access], "JWT Access Cookie could not be saved."
    assert JSON.parse(response.body)["csrf"], "CSRF token is missing in the response."
    assert_response :success

    logout
  end

  test "should not be able to login with invalid credentials" do
    login("notexistinguser@example.com", "12345678")
    assert_response :not_found

    logout
  end

  test "should be able to logout" do
    login

    logout
    assert_response :success
  end
end
