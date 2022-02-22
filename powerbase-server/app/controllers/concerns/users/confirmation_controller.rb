class Users::ConfirmationController < ApplicationController
  schema(:confirm_email) do
    required(:token).value(:string)
  end

  schema(:reconfirm_email) do
    required(:email).value(:string)
    required(:password).value(:string)
  end

  # PUT /confirm_email
  def confirm_email
    if safe_params[:token] == nil
      render json: { error: "Missing confirmation token." }, status: :unprocessable_entity
      return
    end

    @user = User.find_by_confirmation_token(safe_params[:token])

    if @user.confirm
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
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /reconfirm_email
  def reconfirm_email
    @user = User.find_by(unconfirmed_email: safe_params[:email]) || User.find_by(email: safe_params[:email])

    if !@user&.authenticate(safe_params[:password])
      render json: { error: "Invalid email and/or password." }, status: :not_found
      return
    end

    if @user.pending_any_confirmation?
      @user.send_confirmation_instructions
      render status: :no_content
    else
      render json: { error: "Email has already been verified." }, status: :unprocessable_entity
    end
  end
end
