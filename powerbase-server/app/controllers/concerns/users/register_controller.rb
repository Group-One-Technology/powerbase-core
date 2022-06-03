class Users::RegisterController < ApplicationController
  schema(:create) do
    required(:first_name).value(:string)
    required(:last_name).value(:string)
    required(:email).value(:string)
    required(:password).value(:string)
    required(:password_confirmation).value(:string)
  end

  # POST /register
  def create
    existing_user = User.find_by(email: safe_params[:email]) || User.find_by(unconfirmed_email: safe_params[:email])

    if existing_user
      render json: { error: "Email \"#{safe_params[:email]}\" has already been taken" }, status: :unprocessable_entity
      return;
    end

    options = safe_params.output
    options[:unconfirmed_email] = options[:email]
    @user = User.new(options)
    @user.is_admin = User.find_by(is_admin: true).nil?

    if @user.save
      @user.send_confirmation_instructions

      if !@user.is_admin
        render json: @user, status: :created
        return
      end

      payload = { user_id: @user.id }
      session = JWTSessions::Session.new(payload: payload, refresh_by_access_allowed: true)
      tokens = session.login

      response.set_cookie(
        JWTSessions.access_cookie,
        value: tokens[:access],
        httponly: Rails.env.production?,
        same_site: :none,
        secure: true
      )

      render json: { is_admin: @user.is_admin, csrf: tokens[:csrf] }
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
