class ApplcationControllerTest < ActionDispatch::IntegrationTest
  require "json"
  require "test_helper"

  def login(email = "johndoe@powerbase.com", password = "password")
    post "/login",
      params: {
        email: email,
        password: password,
      },
      as: :json
  end

  def logout
    post "/logout", headers: request.headers
  end
end