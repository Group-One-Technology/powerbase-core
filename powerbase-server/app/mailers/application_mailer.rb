class ApplicationMailer < ActionMailer::Base
  default from: "team@trypowerbase.com",
          tag: Rails.env.production? ? "production" : "development"
  layout 'mailer'

  # Support Email to be included in the viewer.
  mattr_accessor :support_email
  @@support_email = "team@trypowerbase.com"
  helper_method :support_email
end
