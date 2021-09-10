class AddDefaultToLogsInBaseMigrationsTable < ActiveRecord::Migration[6.1]
  def change
    change_column_default :base_migrations, :logs, "{}"
  end
end
