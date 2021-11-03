class Guest < ApplicationRecord
  validates :access, presence: true
  enum access: {
    owner: "owner",
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
end
