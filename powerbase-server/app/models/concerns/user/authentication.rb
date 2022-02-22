class User
  # Time interval the confirmation token is valid. nil = unlimited
  mattr_accessor :confirm_within
  @@confirm_within = 7.days

  module Authentication
    extend ActiveSupport::Concern

    protected
      # Generate a friendly string randomly to be used as token.
      # By default, length is 20 characters.
      def friendly_token(length = 20)
        # To calculate real characters, we must perform this operation.
        # See SecureRandom.urlsafe_base64
        rlength = (length * 3) / 4
        SecureRandom.urlsafe_base64(rlength).tr('lIO0', 'sxyz')
      end
  end
end