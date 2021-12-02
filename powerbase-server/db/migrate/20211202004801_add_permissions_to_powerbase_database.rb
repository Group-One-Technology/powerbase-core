class AddPermissionsToPowerbaseDatabase < ActiveRecord::Migration[6.1]
  require 'json'

  def change
    add_column :powerbase_databases, :permissions, :text, :default => ({
      view_base: { access: "everyone" },
      manage_base: { access: "creators only" },
      invite_guests: { access: "creators only" },
      add_tables: { access: "admins and up" },
      delete_tables: { access: "admins and up" },
    }).to_json
  end
end
