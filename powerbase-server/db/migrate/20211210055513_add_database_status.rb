class AddDatabaseStatus < ActiveRecord::Migration[6.1]
  def up
    add_column :powerbase_databases, :status, :string, :default => 'analyzing_base'

    databases = PowerbaseDatabase.all
    databases.each do |database|
      database.status = 'migrated' if database.is_migrated
      database.save
    end

    remove_column :powerbase_databases, :is_migrated
  end

  def down
    add_column :powerbase_databases, :is_migrated, :boolean, :default => false

    databases = PowerbaseDatabase.all
    databases.each do |database|
      database.is_migrated = database.status == 'migrated'
      database.save
    end

    remove_column :powerbase_databases, :status
  end
end
