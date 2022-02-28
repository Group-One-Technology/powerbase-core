class User
  # Time interval the reset password token is valid. nil = unlimited
  mattr_accessor :reset_password_within
  @@reset_password_within = 4.hours

  # Used to reset a user's password.
  # Recoverable adds the following options:
  # Confirmable tracks the following columns:
  # * reset_password_token   - A unique random token
  # * reset_password_sent_at - A timestamp when the reset_password_token was generated (not sent)
  #
  # See https://github.com/heartcombo/devise/blob/main/lib/devise/models/recoverable.rb
  module Recoverable
    extend ActiveSupport::Concern

    included do
      before_update :clear_reset_password_token, if: :password_digest_changed?
    end

    # Update password saving the record and clearing token. Returns true if
    # the passwords are valid and the record was saved, false otherwise.
    def reset_password(new_password, new_password_confirmation)
      if new_password.present?
        self.password = new_password
        self.password_confirmation = new_password_confirmation
        save
      else
        errors.add(:password, :blank)
        false
      end
    end

    # Resets reset password token and send reset password instructions by email.
    def send_reset_password_instructions
      token = set_reset_password_token
      UserMailer.reset_password(user_id: id, token: token).deliver_later
    end

    # Send email notice for successfully resetting the password.
    def send_success_reset_password_notice
      UserMailer.changed_password_notice(user_id: id).deliver_later
    end

    # Checks if the reset password token sent is within the limit time.
    # We do this by calculating if the difference between today and the
    # sending date does not exceed the confirm in time configured.
    # Returns true if the resource is not responding to reset_password_sent_at at all.
    # reset_password_within is a model configuration, must always be an integer value.
    #
    # Example:
    #
    #   # reset_password_within = 1.day and reset_password_sent_at = today
    #   reset_password_period_valid?   # returns true
    #
    #   # reset_password_within = 5.days and reset_password_sent_at = 4.days.ago
    #   reset_password_period_valid?   # returns true
    #
    #   # reset_password_within = 5.days and reset_password_sent_at = 5.days.ago
    #   reset_password_period_valid?   # returns false
    #
    #   # reset_password_within = 0.days
    #   reset_password_period_valid?   # will always return false
    def reset_password_period_valid?
      reset_password_sent_at && reset_password_sent_at.utc >= self.class.reset_password_within.ago.utc
    end

    protected
      # Removes reset_password token
      def clear_reset_password_token
        self.reset_password_token = nil
        self.reset_password_sent_at = nil
      end

      def set_reset_password_token
        raw, enc = Devise.token_generator.generate(self.class, :reset_password_token)
        self.reset_password_token   = enc
        self.reset_password_sent_at = Time.now.utc
        save(validate: false)
        raw
      end

    module ClassMethods
      # Attempt to find a user by password reset token. If a user is found, return it
      # If a user is not found, return nil
      def with_reset_password_token(token)
        reset_password_token = Devise.token_generator.digest(self, :reset_password_token, token)
        find_by(reset_password_token: reset_password_token)
      end
    end
  end
end