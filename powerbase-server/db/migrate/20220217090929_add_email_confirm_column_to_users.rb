class AddEmailConfirmColumnToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :email_confirmed, :boolean, :default => false, :null => false
    add_column :users, :confirm_token, :string
  end
end
