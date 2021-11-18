class PowerbaseField < ApplicationRecord
  include PermissionsHelper

  validates :name, presence: true
  validates :db_type, presence: true
  serialize :options, JSON
  serialize :permissions, JSON

  belongs_to :powerbase_table
  belongs_to :powerbase_field_type
  has_one :field_select_option, dependent: :destroy
  has_many :view_field_options, dependent: :destroy

  def update_guests_access(options)
    guest = options[:guest]
    is_allowed = options[:is_allowed]
    permission = options[:permission].to_s
    access = options[:access].to_s

    allowed_guests = Array(self.permissions[permission]["allowed_guests"])
    restricted_guests = Array(self.permissions[permission]["restricted_guests"])

    if is_allowed == true
      restricted_guests = restricted_guests.select {|guest_id| guest_id != guest.id}
      allowed_guests.push(guest.id) if !does_custom_have_access(access)
    else
      allowed_guests = allowed_guests.select {|guest_id| guest_id != guest.id}
      restricted_guests.push(guest.id) if does_custom_have_access(access)
    end

    self.permissions[permission]["allowed_guests"] = allowed_guests.uniq
    self.permissions[permission]["restricted_guests"] = restricted_guests.uniq
    self.save
  end
end
