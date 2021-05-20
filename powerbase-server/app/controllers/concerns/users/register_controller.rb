class Users::RegisterController < ApplicationController
  schema(:create) do
    required(:first_name).value(:string)
    required(:last_name).value(:string)
    required(:email).value(:string)
    required(:password).value(:string)
    required(:password_confirmation).value(:string)
  end

  # POST /register/create
  def create
    user = User.new(safe_params.output)

    if user.save
      payload = { user_id: user.id }
      session = JWTSessions::Session.new(payload: payload, refresh_by_access_allowed: true)
      tokens = session.login

      response.set_cookie(
        JWTSessions.access_cookie,
        value: tokens[:access],
        httponly: true,
        secure: Rails.env.production?
      )

      render json: { csrf: tokens[:csrf] }
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
