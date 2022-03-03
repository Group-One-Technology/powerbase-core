class ApplicationController < ActionController::API
  include PermissionsHelper
  include JWTSessions::RailsAuthorization
  rescue_from JWTSessions::Errors::Unauthorized, with: :not_authorized
  rescue_from PermissionsHelper::AccessDenied, with: :not_authorized
  rescue_from PermissionsHelper::NotFound, with: :not_found

  def current_user
    @current_user || User.find(payload["user_id"])
  end

  def authorize_access_request!
    super
    set_user_context
  end

  def set_user_context
    if !@user_tracked && current_user != nil
      Sentry.set_user(
        user_id: current_user.id,
        name: current_user.name,
        email: current_user.email,
      )
      @user_tracked = true
    end
  end

  private
    def not_authorized
      render json: { error: "You are not authorized to perform this action.", status: 401 }, status: :unauthorized
    end

    def not_found(exception)
      render json: { error: exception, status: 404 }, status: :not_found
    end
end
