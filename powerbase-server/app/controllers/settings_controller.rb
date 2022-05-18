class SettingsController < ApplicationController
  before_action :authorize_access_request!, except: [:setup_smtp]

  schema(:setup_smtp) do
    required(:address).value(:string)
    required(:port).value(:integer)
    required(:email).value(:string)
    required(:domain).value(:string)
    required(:username).value(:string)
    required(:password).value(:string)
    required(:use_tls).value(:bool)
  end

  # GET /settings/smtp
  def smtp
    raise AccessDenied if !current_user.is_admin

    settings = Setting.where(tag: "smtp")
    smtp_settings = {}
    settings.select {|key, value| key != "email"}.map do |setting|
      smtp_settings[setting.key.to_sym] = setting.value
    end

    render json: smtp_settings
  end

  # POST /settings/smtp
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
