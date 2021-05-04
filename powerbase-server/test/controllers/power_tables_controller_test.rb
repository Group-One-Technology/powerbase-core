require "test_helper"

class TablesControllerTest < ActionDispatch::IntegrationTest
  def connect_database
    post groups_connect_url,
      params: {
        host: "localhost",
        port: "5432",
        username: "postgres",
        password: "postgres",
        database: "powerbase_test",
      },
      as: :json
  end

  test "should get list of tables of connected group" do
    connect_database()

    group = groups(:one)
    get group_tables_url(group_id: group.id)
    assert_response :success
  end
end
