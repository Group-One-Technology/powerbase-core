require 'openssl'

module Crypto
  @@alg = "aes-256-cbc"
  @@key = ENV["API_ENCRYPTION_KEY"]

  def self.encrypt(des_text, iv)
      des = OpenSSL::Cipher::Cipher.new(@@alg)
      des.encrypt
      des.key = @@key
      des.iv = iv.to_s.rjust(16, "0")
      result = des.update(des_text)
      result << des.final
      return Base64.encode64 result
  end

  def self.decrypt(des_text, iv)
      des = OpenSSL::Cipher::Cipher.new(@@alg)
      des.decrypt
      des.key = @@key
      des.iv = iv.to_s.rjust(16, "0")
      result = des.update(Base64.decode64(des_text))
      result << des.final
      return result
  end
end
