require 'openssl'

# Implementation of devise's token generator.
# Generates a token for a model's column. Mostly used for authentication under models/user.rb
#
# Example:
# def set_reset_password_token
#   raw, enc = TokenGenerator.generate(self.class, :reset_password_token)
#   self.reset_password_token   = enc
#   self.reset_password_sent_at = Time.now.utc
#   save(validate: false)
#   raw
# end
#
# See https://github.com/heartcombo/devise/blob/main/lib/devise/token_generator.rb
class Devise::TokenGenerator
  def initialize(key_generator, digest = "SHA256")
    @key_generator = key_generator
    @digest = digest
  end

  def digest(klass, column, value)
    value.present? && OpenSSL::HMAC.hexdigest(@digest, key_for(column), value.to_s)
  end

  def generate(klass, column)
    key = key_for(column)

    loop do
      raw = Devise.friendly_token
      enc = OpenSSL::HMAC.hexdigest(@digest, key, raw)
      break [raw, enc] unless klass.find_by({ column => enc })
    end
  end

  private

  def key_for(column)
    @key_generator.generate_key("Powerbase #{column}")
  end
end
