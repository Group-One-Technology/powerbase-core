class ApplicationController < ActionController::API
  include JWTSessions::RailsAuthorization
  rescue_from JWTSessions::Errors::Unauthorized, with: :not_authorized

  def current_user
    @current_user || User.find(payload['user_id'])
  end

  private
    def not_authorized
      render json: { error: "Not authorized" }, status: :unauthorized
      return
    end

    def check_database_access(database_id, allowed_access = ["everyone"])
      @database = PowerbaseDatabase.find(database_id)

      if !@database
        render json: { error: "Could not find database with id of '#{database_id}'." }, status: :not_found and return
      end

      if @database.user_id != current_user.id
        @current_guest = Guest.find_by(powerbase_database_id: @database.id, user_id: current_user.id)

        if !(allowed_access.include?("everyone") || allowed_access.include?(@current_guest.access))
          render json: { error: "Not authorized" }, status: :unauthorized and return
        end
      end

      return true
    end
end
