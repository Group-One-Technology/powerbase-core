class Users::AuthController < ApplicationController
  before_action :authorize_access_request!

  # GET /auth
  def index
    render json: current_user
  end
end
