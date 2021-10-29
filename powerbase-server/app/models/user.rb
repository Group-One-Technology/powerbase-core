class User < ApplicationRecord
  has_secure_password

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true

  has_many :powerbase_databases
  has_many :guests

  def guest_databases
    self.guests.map {|guest| guest.powerbase_database}
  end
end
