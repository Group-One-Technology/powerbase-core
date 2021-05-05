require "test_helper"

class TablesControllerTest < ActionDispatch::IntegrationTest
  def connect_database
    post databases_connect_url,
      params: {
        host: "localhost",
        port: "5432",
        username: "postgres",
        password: "postgres",
        database: "powerbase_test",
      },
      as: :json
  end

  test "should get list of tables of connected database" do
    connect_database()

    get databases_tables_url
    assert_response :success
  end
end
