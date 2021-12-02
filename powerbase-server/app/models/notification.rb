class Notification < ApplicationRecord
  validates :data_type, presence: true
  validates :message, presence: true
  enum type: {
    base_invite: "base_invite",
    accept_invite: "accept_invite",
    reject_invite: "reject_invite",
  }

  belongs_to :user
end
