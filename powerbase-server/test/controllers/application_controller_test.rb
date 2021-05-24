class ApplcationControllerTest < ActionDispatch::IntegrationTest
  require "json"
  require "test_helper"

  @@request = {
    cookies: {},
    headers: {},
  }

  def login(email = "johndoe@powerbase.com", password = "password")
    post "/login",
      params: {
        email: email,
        password: password,
      },
      as: :json

    @@request[:cookies][:jwt_access] = cookies[:jwt_access]
    @@request[:headers]["X-CSRF-TOKEN"] = JSON.parse(response.body)["csrf"]
  end

  def logout
    post "/logout", headers: @@request[:headers]
  end
end