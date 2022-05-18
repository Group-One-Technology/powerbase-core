class UsersController < ApplicationController
  before_action :authorize_access_request!, except: [:has_admin]

  schema(:guest) do
    required(:database_id)
  end

  # GET /users/has_admin
  def has_admin
    has_admin = !User.find_by(is_admin: true).nil?
    render json: { has_admin: has_admin }
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

  # PUT /auth/onboarded
  def onboarded
    current_user.update(is_onboarded: true)
    render status: :no_content
  end
end
