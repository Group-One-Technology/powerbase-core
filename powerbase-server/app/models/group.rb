class Group < ApplicationRecord
  validates :name, presence: true
  validates :connection_string, presence: true
  enum database_type: { postgres: "postgres" }, _prefix: :database

  # TODO: Add Figaro Gem for key env
  attr_encrypted :connection_string, key: 'some_key', algorithm: 'aes-256-cbc', mode: :single_iv_and_salt, insecure_mode: true
end
