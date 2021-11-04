class ApplicationController < ActionController::API
  include PermissionsHelper
  include JWTSessions::RailsAuthorization
  rescue_from JWTSessions::Errors::Unauthorized, with: :not_authorized
  rescue_from PermissionsHelper::AccessDenied, with: :not_authorized
  rescue_from PermissionsHelper::NotFound, with: :not_found

  def current_user
    @current_user || User.find(payload['user_id'])
  end

  private
    def not_authorized
      render json: { error: "You are not authorized to perform this action." }, status: :unauthorized
    end

    def not_found(exception)
      render json: exception, status: :not_found
    end
end
