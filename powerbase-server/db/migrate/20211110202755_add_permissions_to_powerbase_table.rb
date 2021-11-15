class AddPermissionsToPowerbaseTable < ActiveRecord::Migration[6.1]
  require 'json'

  def change
    add_column :powerbase_tables, :permissions, :text, :default => ({
      view_table: { access: "everyone" },
      manage_table: { access: "admins and up" },
      add_fields: { access: "admins and up" },
      delete_fields: { access: "admins and up" },
      add_views: { access: "editors and up" },
      manage_views: { access: "editors and up" },
      delete_views: { access: "editors and up" },
      add_records: { access: "editors and up" },
      delete_records: { access: "editors and up" },
      comment_records: { access: "commenters and up" },
    }).to_json
  end
end