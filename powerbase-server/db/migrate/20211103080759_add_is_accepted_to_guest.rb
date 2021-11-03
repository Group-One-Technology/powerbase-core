class AddIsAcceptedToGuest < ActiveRecord::Migration[6.1]
  def change
    add_column :guests, :is_accepted, :boolean, :default => false
  end
end
