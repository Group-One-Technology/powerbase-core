require "controllers/application_controller_test"

class PowerbaseDatabasesControllerTest < ApplicationControllerTest
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
    post connect_databases_url,
      params: {
        name: "Powerbase Test",
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
