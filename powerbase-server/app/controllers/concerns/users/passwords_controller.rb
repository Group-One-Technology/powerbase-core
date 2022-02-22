class Users::PasswordsController < ApplicationController
  schema(:forgot) do
    required(:email).value(:string)
  end

  schema(:reset) do
    required(:token).value(:string)
    required(:password).value(:string)
    required(:password_confirmation).value(:string)
  end

  # PUT /forgot_password
  def forgot
    @user = User.find_by(email: safe_params[:email])
    if @user.present?
      @user.send_reset_password_instructions
      render status: :no_content
    else
      render json: { error: "Email address not found. Please check and try again." }, status: :not_found
    end
  end

  # PUT /reset_password
  def reset
    @user = User.with_reset_password_token(safe_params[:token])

    if !(@user.present? && @user.reset_password_period_valid?)
      render json: { error: "Link is invalid or has expired. Try requesting a new reset password link." }, status: :not_found
      return
    end

    if @user.reset_password(safe_params[:password], safe_params[:password_confirmation])
      @user.send_success_reset_password_notice
      render status: :no_content
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
