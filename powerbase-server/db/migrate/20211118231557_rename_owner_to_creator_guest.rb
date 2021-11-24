class RenameOwnerToCreatorGuest < ActiveRecord::Migration[6.1]
  def up
    guests = Guest.where(access: "owner")
    guests.each do |guest|
      guest.access = "creator"
      guest.save
    end
  end

  def down
    guests = Guest.where(access: "creator")
    guests.each do |guest|
      guest.access = "owner"
      guest.save
    end
  end
end
