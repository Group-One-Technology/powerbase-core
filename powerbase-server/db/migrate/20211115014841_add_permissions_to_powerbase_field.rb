class AddPermissionsToPowerbaseField < ActiveRecord::Migration[6.1]
  require 'json'

  def change
    add_column :powerbase_fields, :permissions, :text, :default => ({
      view_field: { access: "everyone" },
      manage_field: { access: "admins and up" },
      edit_field_data: { access: "editors and up" },
    }).to_json
  end
end
