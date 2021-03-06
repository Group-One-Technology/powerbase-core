class Users::RefreshController < ApplicationController
  before_action :authorize_refresh_by_access_request!

  # POST /refresh
  def create
    session = JWTSessions::Session.new(payload: claimless_payload, refresh_by_access_allowed: true)
    tokens = session.refresh_by_access_payload

    response.set_cookie(
      JWTSessions.access_cookie,
      value: tokens[:access],
      httponly: Rails.env.production?,
      same_site: :none,
      secure: true
    )

    render json: { csrf: tokens[:csrf] }
  end
end
