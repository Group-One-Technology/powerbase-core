class User
  # Time interval the confirmation token is valid. nil = unlimited
  mattr_accessor :confirm_within
  @@confirm_within = 7.days

  # Used to check whether an account is verified or not.
  # Confirmable tracks the following columns:
  # * confirmation_token   - A unique random token
  # * confirmed_at         - A timestamp when the user clicked the confirmation link
  # * confirmation_sent_at - A timestamp when the confirmation_token was generated (not sent)
  # * unconfirmed_email    - An email address copied from the email attr. After confirmation
  #                          this value is copied to the email attr then cleared.
  #
  # See https://github.com/heartcombo/devise/blob/main/lib/devise/models/confirmable.rb
  module Confirmable
    extend ActiveSupport::Concern

    included do
      before_create :generate_confirmation_token
    end

    def initialize(*args, &block)
      @raw_confirmation_token = nil
      super
    end

    # Updates the email by storing it to unconfirmed email. Returns true if
    # the email is valid and the record was saved, false otherwise.
    def email_change(new_email)
      if new_email.present?
        if self.email != new_email
          self.email = new_email
          self.unconfirmed_email = new_email
          self.confirmed_at = nil
          save(validate: false)
        else
          errors.add(:email, 'must not be the same with the new email')
          false
        end
      else
        errors.add(:email, :blank)
        false
      end
    end

    # Confirm a user by setting it's confirmed_at to actual time. If the user
    # is already confirmed, add an error to email field. If the user is invalid
    # add errors
    def confirm
      if pending_any_confirmation?
        if confirmation_period_expired?
          self.errors.add(:email, "confirmation link has expired.")
          return false
        end

        self.confirmed_at = Time.now.utc

        if pending_reconfirmation?
          self.email = unconfirmed_email
          self.unconfirmed_email = nil

          # We need to validate in such cases to enforce e-mail uniqueness
          save(validate: true)
        else
          save(validate: true)
        end
      else
        self.errors.add(:email, "already confirmed.")
        false
      end
    end

    # Checks whether the record requires any confirmation.
    def pending_any_confirmation?
      !confirmed? || pending_reconfirmation?
    end

    # Verifies whether a user is confirmed or not
    def confirmed?
      !!confirmed_at
    end

    def pending_reconfirmation?
      unconfirmed_email.present?
    end

    # Checks if the user confirmation happens before the token becomes invalid
    # Examples:
    #
    #   # confirm_within = 3.days and confirmation_sent_at = 2.days.ago
    #   confirmation_period_expired?  # returns false
    #
    #   # confirm_within = 3.days and confirmation_sent_at = 4.days.ago
    #   confirmation_period_expired?  # returns true
    #
    #   # confirm_within = nil
    #   confirmation_period_expired?  # will always return false
    #
    def confirmation_period_expired?
      self.class.confirm_within && self.confirmation_sent_at && (Time.now.utc > self.confirmation_sent_at.utc + self.class.confirm_within)
    end

    # Send change email notice.
    def send_change_email_notice(old_email, new_email)
      UserMailer.changed_email_notice(user_id: id, old_email: old_email, email: new_email).deliver_later
    end

    # Send confirmation instructions by email
    def send_confirmation_instructions
      unless @raw_confirmation_token && self.confirmation_token != nil
        generate_confirmation_token!
      end
      UserMailer.confirm_email(user_id: id).deliver_later
    end

    # Resend confirmation token.
    # Regenerates the token if the period is expired.
    def resend_confirmation_instructions
      if pending_any_confirmation?
        if self.unconfirmed_email == nil
          self.unconfirmed_email = self.email
          self.save(validate: false)
        end
        send_confirmation_instructions
      end
    end

    # Generates a new random token for confirmation, and stores
    # the time this token is being generated in confirmation_sent_at
    def generate_confirmation_token
      if self.confirmation_token && !confirmation_period_expired?
        @raw_confirmation_token = self.confirmation_token
      else
        self.confirmation_token = @raw_confirmation_token = Devise.friendly_token
        self.confirmation_sent_at = Time.now.utc
      end
    end

    def generate_confirmation_token!
      generate_confirmation_token && save(validate: false)
    end
  end
end