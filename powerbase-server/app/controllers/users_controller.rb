class UsersController < ApplicationController
  before_action :authorize_access_request!

  schema(:guest) do
    required(:database_id)
  end

  # GET /auth/databases/:database_id/guest
  def guest
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of '#{safe_params[:database_id]}'") if !@database

    if Guest.owner?(current_user.id, @database)
      render json: {
        id: current_user.id,
        access: "creator",
        permissions: Guest.owner_permissions,
        user_id: current_user.id,
        database_id: @database.id,
        database_name: @database.name,
        is_accepted: true,
      }
    else
      @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @database.id)
      raise AccessDenied if !@guest

      render json: {
        id: @guest.id,
        access: @guest.access,
        permissions: @guest.permissions,
        user_id: @guest.user_id,
        inviter_id: @guest.inviter_id,
        database_id: @database.id,
        database_name: @database.name,
        is_accepted: @guest.is_accepted,
      }
    end
  end
end
