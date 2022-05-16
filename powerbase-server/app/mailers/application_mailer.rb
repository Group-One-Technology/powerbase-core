class ApplicationMailer < ActionMailer::Base
  default from: "team@trypowerbase.com",
          tag: Rails.env.production? ? "production" : "development"
  layout 'mailer'

  # Support Email to be included in the viewer.
  mattr_accessor :support_email
  @@support_email = "team@trypowerbase.com"
  helper_method :support_email

  before_action :set_email_options
  after_action :set_delivery_options

  private
    def set_email_options
      email_setting = Setting.find_by(tag: "smtp", key: "email")
      @support_email = email_setting&.value
      @sender_email = email_setting&.value
    end

    def set_delivery_options
      settings = Setting.where(tag: "smtp")

      if settings.length > 0
        smtp_settings = {}
        settings.select {|key, value| key != "email"}.map do |setting|
          smtp_settings[setting.key.to_sym] = setting.value
        end

        mail.delivery_method.settings.merge!(
          address: smtp_settings[:address],
          port: smtp_settings[:port],
          domain: smtp_settings[:domain],
          user_name: smtp_settings[:username],
          password: smtp_settings[:password],
          authentication: :plain,
          enable_starttls_auto: smtp_settings[:use_tls],
        )
      end
    end
end
