class Group < ApplicationRecord
  validates :name, presence: true
  validates :connection_string, presence: true
  enum database_type: { postgres: "postgres" }, _prefix: :database

  attr_encrypted :connection_string, key: ENV["encyrption_key"],
    algorithm: "aes-256-cbc", mode: :single_iv_and_salt, insecure_mode: true

  has_many :power_tables
end
