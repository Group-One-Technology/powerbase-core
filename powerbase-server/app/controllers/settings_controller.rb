class SettingsController < ApplicationController
  before_action :authorize_access_request!, except: [:setup_smtp]

  schema(:setup_general) do
    optional(:sample_database_id).value(:integer)
  end

  schema(:setup_smtp) do
    required(:address).value(:string)
    required(:port).value(:integer)
    required(:email).value(:string)
    required(:domain).value(:string)
    required(:username).value(:string)
    required(:password).value(:string)
    required(:use_tls).value(:bool)
  end

  # GET /settings/general
  def general
    settings = Setting.where(tag: "general")
    general_settings = {}
    settings.map do |setting|
      if setting.key == "sample_database_id" && !setting.value.nil?
        database = PowerbaseDatabase.find(setting.value)

        if database
          owner = database.user
          general_settings[:sample_database] = {
            id: database.id,
            name: database.name,
            owner: {
              user_id: owner.id,
              first_name: owner.first_name,
              last_name: owner.last_name,
              name: "#{owner.first_name} #{owner.last_name}",
              email: owner.email,
            },
          }
        end
      else
        general_settings[setting.key.to_sym] = setting.value
      end
    end

    render json: general_settings
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

  # POST /settings/general
  def setup_general
    raise AccessDenied if !current_user.is_admin

    safe_params.output.each do |key, value|
      setting = Setting.find_by(key: key) || Setting.new
      setting.key = key
      setting.value = value
      setting.tag = "general"

      if setting.key == "sample_database_id" && !value.nil?
        database = PowerbaseDatabase.find(value)
        raise NotFound.new("Could not find database with id of '#{value}'") if !database
      end

      setting.save
    end

    render status: :ok
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

  # POST /settings/send_test_email
  def send_test_email
    MainMailer.test_email(user_id: current_user.id).deliver_later
    render status: :no_content
  end
end
