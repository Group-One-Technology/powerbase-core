require "controllers/application_controller_test"

class TableViewsControllerTest < ApplcationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of views of a given table" do
    table = powerbase_tables(:one)
    get table_views_url(table_id: table.id)
    assert_response :success
  end
end
