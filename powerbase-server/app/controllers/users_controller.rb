class UsersController < ApplicationController
  before_action :authorize_access_request!, except: [:confirm_email]

  schema(:confirm_email) do
    required(:token).value(:string)
  end

  schema(:guest) do
    required(:database_id)
  end

  # PUT /confirm_email
  def confirm_email
    @user = if safe_params[:token] != nil
        User.find_by_confirm_token(safe_params[:token])
      else
        nil
      end

    if @user
      @user.email_activate
      session = JWTSessions::Session.new(payload: { user_id: @user.id }, refresh_by_access_allowed: true)
      tokens = session.login

      response.set_cookie(
        JWTSessions.access_cookie,
        value: tokens[:access],
        httponly: true,
        same_site: Rails.env.production? ? :none : nil,
        secure: Rails.env.production?
      )

      render json: { csrf: tokens[:csrf] }
    else
      render json: { error: "User could not be found." }, status: :unprocessable_entity
    end
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
