class Users::AuthController < ApplicationController
  before_action :authorize_access_request!

  # GET /auth
  def index
    render json: format_json(current_user)
  end

  private
    def format_json(user)
      {
        id: user.id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_onboarded: user.is_onboarded,
        is_confirmed: user.is_confirmed,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    end
end
