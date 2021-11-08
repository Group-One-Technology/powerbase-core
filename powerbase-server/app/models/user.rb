class User < ApplicationRecord
  include PermissionsHelper

  has_secure_password

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true

  has_many :powerbase_databases
  has_many :guests, -> { where is_accepted: true }
  has_many :guest_invitations, -> { where is_accepted: false }, class_name: "Guest"

  def shared_databases
    self.guests.map {|guest| guest.powerbase_database}
  end

  # * Checks whether the current user has access to the ff:
  # Accepts the following options:
  # :permission :: a given ability to check whether the user can do or not.
  # :resource :: the resource to check the given permission against.
  # :guest :: (optional) the guest object or guest_id
  def can?(permission, resource, guest = nil)
    resource_type = nil
    database = nil

    if BASE_PERMISSIONS.include?(permission)
      resource_type = :database
      if !resource.is_a?(ActiveRecord::Base)
        database = PowerbaseDatabase.find(resource)
        raise NotFound.new("Could not find database with id of #{resource}.") if !database
      else
        database = resource
      end
    elsif TABLE_PERMISSIONS.include?(permission)
      resource_type = :table
      if !resource.is_a?(ActiveRecord::Base)
        table = PowerbaseTable.find(resource)
        raise NotFound.new("Could not table with id of #{resource}.") if !table
      else
        table = resource
      end

      database = table.powerbase_database
    elsif FIELD_PERMISSIONS.include?(permission)
      resource_type = :field
      if !resource.is_a?(ActiveRecord::Base)
        field = PowerbaseField.find(resource)
        raise NotFound.new("Could not field with id of #{resource}.") if !field
      else
        field = resource
      end

      database = field.powerbase_table.powerbase_database
    elsif VIEW_PERMISSIONS.include?(permission)
      resource_type = :view
      if !resource.is_a?(ActiveRecord::Base)
        view = TableView.find(resource)
        raise NotFound.new("Could not view with id of #{resource}.") if !view
      else
        view = resource
      end

      database = view.powerbase_table.powerbase_database
    end

    return true if database.user_id == self.id

    guest = Guest.find(guest) if !database.is_a?(ActiveRecord::Base)
    guest = guest || Guest.find_by(user_id: self.id, powerbase_database_id: database.id)
    raise AccessDenied if !guest

    if guest.access.to_sym != :custom
      permissions = ROLES[guest.access.to_sym]
      return true if permissions.include?(:all)
      return true if permissions.include? permission
    else
      # TODO: Add custom permissions checker
      # - Pass the database_id/table_id/view_id for checking.
    end

    raise AccessDenied
  end
end
