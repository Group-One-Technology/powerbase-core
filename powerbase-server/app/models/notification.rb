class Notification < ApplicationRecord
  validates :data_type, presence: true
  validates :message, presence: true
  enum data_type: {
    base_invite: "base_invite",
    accept_invite: "accept_invite",
    reject_invite: "reject_invite",
    leave_base: "leave_base",
  }
  serialize :object, JSON

  belongs_to :user
  belongs_to :subject, class_name: "User"
end
