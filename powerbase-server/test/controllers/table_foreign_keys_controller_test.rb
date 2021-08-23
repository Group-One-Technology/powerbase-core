require "controllers/application_controller_test"

class TableForeignKeysControllerTest < ApplicationControllerTest
  setup do
    login
  end

  teardown do
    logout
  end

  test "should get list of foreign keys of a given table" do
    table = powerbase_tables(:one)
    get table_foreign_keys_url(table_id: table.id)
    assert_response :success
  end
end
