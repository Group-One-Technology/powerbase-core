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

    if @user.save
      @user.send_confirmation_instructions
      render json: @user, status: :created
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
