require "test_helper"

class PowerbaseDatabasesControllerTest < ActionDispatch::IntegrationTest
  test "should get list of databases" do
    get databases_url
    assert_response :success
  end

  test "should connect to a database" do
    post databases_connect_url,
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
