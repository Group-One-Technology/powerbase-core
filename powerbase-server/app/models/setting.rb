class Setting < ApplicationRecord
  validates :key, presence: true
  validates :value, presence: true

  attr_encrypted :value, key: ENV["ENCRYPTION_KEY"],
    algorithm: "aes-256-cbc", mode: :single_iv_and_salt, insecure_mode: true
end
