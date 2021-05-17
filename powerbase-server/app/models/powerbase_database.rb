class PowerbaseDatabase < ApplicationRecord
  validates :name, presence: true
  validates :connection_string, presence: true
  enum adapter: { postgresql: "postgresql", mysql2: "mysql2" }, _prefix: true
  enum color: {
    gray: "gray",
    red: "red",
    yellow: "yellow",
    green: "green",
    blue: "blue",
    indigo: "indigo",
    purple: "purple",
    pink: "pink",
  }, _prefix: true

  attr_encrypted :connection_string, key: ENV["encryption_key"],
    algorithm: "aes-256-cbc", mode: :single_iv_and_salt, insecure_mode: true

  has_many :powerbase_tables
  has_many :powerbase_fields, through: :powerbase_tables
end
