require "controllers/application_controller_test"

class LoginControllerTest < ApplcationControllerTest
  setup do
  end

  test "should be able to login" do
    login
    assert_response :success

    logout
  end

  test "should not be able to login with invalid credentials" do
    login("notexistinguser@example.com", "12345678")
    assert_response :not_found
  end

  test "should be able to logout" do
    login

    logout
    assert_response :success
  end
end
