require "test_helper"

class GroupsControllerTest < ActionDispatch::IntegrationTest
  test "should connect to a group" do
    post groups_connect_url,
      params: {
        host: "localhost",
        port: "5432",
        username: "postgres",
        password: "postgres",
        database: "powerbase_test",
      },
      as: :json

    assert_response :success
  end
end
