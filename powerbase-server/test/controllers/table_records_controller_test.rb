require "controllers/application_controller_test"

class TableRecordsControllerTest <ApplcationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of records of a given table" do
    table = powerbase_tables(:one)
    get table_records_url(table_id: table.id)
    assert_response :success
  end
end
