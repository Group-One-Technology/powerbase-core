class AddDefaultToLogsInBaseMigrationsTable < ActiveRecord::Migration[6.1]
  def change
    change_column_default :base_migrations, :logs, from: nil, to: "{}"
  end
end
