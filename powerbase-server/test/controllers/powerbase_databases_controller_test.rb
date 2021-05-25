require "controllers/application_controller_test"

class PowerbaseDatabasesControllerTest < ApplcationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of databases" do
    get databases_url
    assert_response :success
  end

  test "should connect to a database" do
    post databases_connect_url,
      params: {
        adapter: "postgresql",
        host: "localhost",
        port: "5432",
        username: "postgres",
        password: "postgres",
        database: "powerbase_test",
        color: "red",
      },
      headers: @@request[:headers],
      as: :json

    assert_response :success
  end
end
