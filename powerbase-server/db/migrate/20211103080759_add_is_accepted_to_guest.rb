class AddIsAcceptedToGuest < ActiveRecord::Migration[6.1]
  def change
    add_column :guests, :is_accepted, :boolean, :default => false
    add_reference :guests, :inviter, foreign_key: { to_table: :users }
  end
end
