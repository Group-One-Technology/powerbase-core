class PasswordsController < ApplicationController
  schema(:forgot) do
    required(:email).value(:string)
  end

  schema(:reset) do
    required(:token).value(:string)
    required(:password).value(:string)
    required(:password_confirmation).value(:string)
  end

  def forgot
    @user = User.find_by(email: safe_params[:email])
    if @user.present?
      @user.generate_password_token!
      # Deliver email here
      render json: :no_content
    else
      render json: { error: "Email address not found. Please check and try again." }, status: :not_found
    end
  end

  def reset
    @user = User.find_by(reset_password_token: safe_params[:token])

    if !(@user.present? && @user.password_token_valid?)
      render json: { error: "Link is invalid or has expired. Try requesting a new reset password link." }, status: :not_found
      return
    end

    if @user.reset_password!(password: safe_params[:password], password_confirmation: safe_params[:password_confirmation])
      # Deliver email here
      render json: :no_content
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
