require "controllers/application_controller_test"

class PowerbaseFieldsControllerTest < ApplcationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of fields of a given table" do
    table = powerbase_tables(:one)
    get table_fields_url(table_id: table.id)
    assert_response :success
  end
end
