require "controllers/application_controller_test"

class BaseConnectionsControllerTest < ApplicationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of connections of a given base" do
    database = powerbase_databases(:one)
    get database_connections_url(database_id: database.id)
    assert_response :success
  end

  test "should get list of connections of a given table" do
    table = powerbase_tables(:one)
    get table_connections_url(table_id: table.id)
    assert_response :success
  end
end
