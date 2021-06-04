require "controllers/application_controller_test"

class TablesControllerTest < ApplcationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  def connect_database
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
      as: :json
  end

  test "should get list of tables of connected database" do
    connect_database()

    database = powerbase_databases(:one)
    get database_tables_url(database_id: database.id)
    assert_response :success
  end
end
