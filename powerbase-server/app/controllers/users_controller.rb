class UsersController < ApplicationController
  before_action :authorize_access_request!, except: [:has_admin]

  schema(:update_account) do
    required(:first_name).value(:string)
    required(:last_name).value(:string)
    required(:email).value(:string)
    required(:password).value(:string)
  end

  schema(:update_password) do
    required(:current_password).value(:string)
    required(:password).value(:string)
    required(:password_confirmation).value(:string)
  end

  schema(:guest) do
    required(:database_id)
  end

  # PUT /auth/account
  def update_account
    if current_user&.authenticate(safe_params[:password])
      user = User.find(current_user.id)
      user.first_name = safe_params[:first_name]
      user.last_name = safe_params[:last_name]
      user.save

      current_email = user.email
      if current_email != safe_params[:email]
        existing_users = User.where(email: safe_params[:email]).where.not(id: current_user.id) ||
          User.where(unconfirmed_email: safe_params[:email]).where.not(id: current_user.id)

        if existing_users.length > 0
          render json: { error: "User with email of \"#{safe_params[:email]}\" already exists." }, status: :unprocessable_entity
          return
        end

        if user.email_change(safe_params[:email])
          user.send_confirmation_instructions
          user.send_change_email_notice(current_email, safe_params[:email])
          render status: :no_content
        else
          render json: { error: user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render status: :no_content
      end
    else
      render json: { error: "Invalid password. Could not update account." }, status: :unauthorized
    end
  end

  # PUT /auth/password
  def update_password
    if current_user&.authenticate(safe_params[:current_password])
      if safe_params[:current_password] == safe_params[:password]
        render json: { error: 'New password must not be the same with the current password' }, status: :unprocessable_entity
        return
      end

      if current_user.reset_password(safe_params[:password], safe_params[:password_confirmation])
        current_user.send_success_reset_password_notice
        render status: :no_content
      else
        render json: { error: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Invalid current password. Could not update password." }, status: :unauthorized
    end
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
