require "controllers/application_controller_test"

class TableRecordsControllerTest < ApplicationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of records of a given table" do
    table = powerbase_tables(:one)
    put table_records_table_url(id: table.id),
      headers: @@request[:headers],
      as: :json
    assert_response :success
  end
end
