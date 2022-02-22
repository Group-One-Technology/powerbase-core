class User
  module Recoverable
    extend ActiveSupport::Concern

    def generate_password_token!
      self.reset_password_token = friendly_token
      self.reset_password_sent_at = Time.now.utc
      save!
    end

    def password_token_valid?
      (self.reset_password_sent_at + 4.hours) > Time.now.utc
    end

    def reset_password!(password: nil, password_confirmation: nil)
      self.reset_password_token = nil
      self.password = password
      self.password_confirmation = password_confirmation
      save!
    end
  end
end