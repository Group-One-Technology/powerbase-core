class HubspotDatabase < ApplicationRecord
  validates :name, presence: true
  validates :connection_string, presence: true
  validates :database_size, presence: true
  enum adapter: { postgresql: "postgresql" }, _prefix: true
  attr_encrypted :connection_string, key: ENV["encryption_key"],
    algorithm: "aes-256-cbc", mode: :single_iv_and_salt, insecure_mode: true

  belongs_to :user
  belongs_to :powerbase_database, optional: true
end
