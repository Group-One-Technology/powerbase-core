require "controllers/application_controller_test"

class RefreshControllerTest < ApplcationControllerTest
  test "should be able to get current user" do
    login

    get auth_url
    assert JSON.parse(response.body)["id"], "Current user is missing from the response."
    assert_response :success

    logout
  end

  test "should not be able to get current user for unauthenticated user" do
    get auth_url
    assert_not JSON.parse(response.body)["id"], "Current user should not be in the response."
    assert_response :unauthorized
  end

  test "should be able to refresh the token" do
    login

    post refresh_url, headers: @@request[:headers]
    assert_response :success

    logout
  end

  test "should not be able to refresh the token for unauthenticated user" do
    post refresh_url
    assert_response :unauthorized
  end
end
