class SettingsController < ApplicationController
  schema(:setup_smtp) do
    required(:address).value(:string)
    required(:port).value(:integer)
    required(:email).value(:string)
    required(:domain).value(:string)
    required(:username).value(:string)
    required(:password).value(:string)
    required(:use_tls).value(:bool)
  end

  # POST /setup_smtp
  def setup_smtp
    has_admin = !User.find_by(is_admin: true).nil?
    if has_admin
      authorize_access_request!
      raise AccessDenied if !current_user.is_admin
    end

    safe_params.output.each do |key, value|
      setting = Setting.find_by(key: key) || Setting.new
      setting.key = key
      setting.value = value
      setting.tag = "smtp"
      setting.save
    end

    render status: :ok
  end
end
