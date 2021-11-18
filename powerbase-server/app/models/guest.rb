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
    }, _prefix: true
  serialize :permissions, JSON

  belongs_to :user
  belongs_to :inviter, class_name: "User"
  belongs_to :powerbase_database

  def permissions
    if self.access.to_sym != :custom
      permissions = {}
      PERMISSIONS.each do |permission|
        permissions[permission] = (ROLES[self.access.to_sym].include?(permission) || ROLES[self.access.to_sym].include?(:all))
      end
      permissions
    else
      super
    end
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
