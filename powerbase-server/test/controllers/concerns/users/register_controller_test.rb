require "controllers/application_controller_test"

class RegisterControllerTest < ApplcationControllerTest
  test "should be able to register" do
    post register_url,
      params: {
        first_name: "Percy",
        last_name: "Jackson",
        email: "percyjackson@powerbase.com",
        password: "password",
        password_confirmation: "password",
      },
      as: :json
    assert cookies[:jwt_access], "JWT Access Cookie could not be saved."
    assert JSON.parse(response.body)["csrf"], "CSRF token is missing in the response."
    assert_response :success

    logout
  end

  test "should not be able to register for duplicate emails" do
    user = users(:one)

    post register_url,
      params: {
        first_name: "Percy",
        last_name: "Jackson",
        email: user.email,
        password: "password",
        password_confirmation: "password",
      },
      as: :json
    assert JSON.parse(response.body)["errors"], "Error for duplicate email is not in the response."
    assert_response :unprocessable_entity

    logout
  end
end
