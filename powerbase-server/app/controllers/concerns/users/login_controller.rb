class Users::LoginController < ApplicationController
  before_action :authorize_access_request!, only: [:destroy]

  schema(:create) do
    required(:email).value(:string)
    required(:password).value(:string)
  end

  # POST /login
  def create
    user = User.find_by(email: safe_params[:email])

    if user&.authenticate(safe_params[:password])
      payload = { user_id: user.id }
      session = JWTSessions::Session.new(payload: payload, refresh_by_access_allowed: true)
      tokens = session.login

      response.set_cookie(
        JWTSessions.access_cookie,
        value: tokens[:access],
        httponly: Rails.env.production?,
        same_site: :none,
        secure: true
      )

      render json: { csrf: tokens[:csrf] }
    else
      not_found
    end
  end

  # POST /logout
  def destroy
    session = JWTSessions::Session.new(payload: payload)
    session.flush_by_access_payload
    render status: :ok
  end

  private
    def not_found
      render json: { error: "Invalid email and/or password." }, status: :not_found
    end
end