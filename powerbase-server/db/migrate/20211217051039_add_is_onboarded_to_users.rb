class AddIsOnboardedToUsers < ActiveRecord::Migration[6.1]
  def up
    add_column :users, :is_onboarded, :boolean, :default => false

    users = User.all
    users.each do |user|
      user.update(is_onboarded: true)
    end
  end

  def down
    remove_column :users, :is_onboarded
  end
end
