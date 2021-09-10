class ChangeErrorLogsToArrayInBaseMigrationTable < ActiveRecord::Migration[6.1]
  def up
    change_column :base_migrations, :logs, :text, array: true, default: [], using: "(string_to_array(logs, ','))"
  end

  def down
    change_column :base_migrations, :logs, :text, array: false, default: nil, using: "(array_to_string(logs, ','))"
  end
end
