class Guest < ApplicationRecord
  include PermissionsHelper

  validates :access, presence: true
  enum access: {
    creator: "creator",
    admin: "admin",
    editor: "editor",
    commenter: "commenter",
    viewer: "viewer",
    custom: "custom",
    }
  serialize :permissions, JSON

  belongs_to :user
  belongs_to :inviter, class_name: "User"
  belongs_to :powerbase_database

  def permissions
    super || {}
  end

  def self.owner?(user_id, database)
    return database.user_id == user_id
  end

  def self.owner_permissions
    permissions = {}
    PERMISSIONS.each do |permission|
      permissions[permission] = true
    end
    permissions
  end
end
