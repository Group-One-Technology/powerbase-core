# Partial implemenation of devise.
module Devise
  # Stores the token generator
  mattr_accessor :token_generator
  @@token_generator = nil

  # Generate a friendly string randomly to be used as token.
  # By default, length is 20 characters.
  def self.friendly_token(length = 20)
    # To calculate real characters, we must perform this operation.
    # See SecureRandom.urlsafe_base64
    rlength = (length * 3) / 4
    SecureRandom.urlsafe_base64(rlength).tr('lIO0', 'sxyz')
  end
end

Devise.token_generator = if ENV["AUTH_TOKEN_ENCRYPTION_KEY"] != nil && ENV["AUTH_TOKEN_ENCRYPTION_KEY"].length > 0
  Devise::TokenGenerator.new(
    ActiveSupport::CachingKeyGenerator.new(
      ActiveSupport::KeyGenerator.new(ENV["AUTH_TOKEN_ENCRYPTION_KEY"])
    )
  )
end
