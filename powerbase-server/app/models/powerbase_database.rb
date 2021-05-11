class PowerbaseDatabase < ApplicationRecord
  validates :name, presence: true
  validates :connection_string, presence: true
  enum database_type: { postgres: "postgres", mysql: "mysql" }, _prefix: :database

  attr_encrypted :connection_string, key: ENV["encryption_key"],
    algorithm: "aes-256-cbc", mode: :single_iv_and_salt, insecure_mode: true

  has_many :powerbase_tables
  has_many :powerbase_fields, through: :powerbase_tables
end
