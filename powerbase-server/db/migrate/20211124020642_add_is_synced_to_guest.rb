class AddIsSyncedToGuest < ActiveRecord::Migration[6.1]
  def change
    add_column :guests, :is_synced, :boolean, :default => false

    existing_guests = Guest.all
    existing_guests.each do |guest|
      guest.is_synced = true
      guest.save
    end
  end
end
