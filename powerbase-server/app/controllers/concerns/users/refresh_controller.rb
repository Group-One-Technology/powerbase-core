class Users::RefreshController < ApplicationController
  before_action :authorize_refresh_by_access_request!, only: :create
  before_action :authorize_access_request!, only: :auth

  # POST /refresh
  def create
    session = JWTSessions::Session.new(payload: claimless_payload, refresh_by_access_allowed: true)
    tokens = session.refresh_by_access_payload

    response.set_cookie(
      JWTSessions.access_cookie,
      value: tokens[:access],
      httponly: true,
      secure: Rails.env.production?
    )

    render json: { csrf: tokens[:csrf] }
  end

  # GET /auth
  def auth
    render json: current_user
  end
end
