include SequelHelper

class ConvertDatabaseSizeToDecimal < ActiveRecord::Migration[6.1]
  def up
    remove_column :base_migrations, :database_size
    add_column :base_migrations, :database_size, :decimal, :null => true

    databases = PowerbaseDatabase.all
    databases.each do |database|
      db_size = nil

      case database.adapter
      when "postgresql"
        db_size = sequel_connect(database) do |db|
          db.select(Sequel.lit('pg_database_size(current_database()) AS size'))
            .first[:size]
        end
      when "mysql2"
        db_size = sequel_connect(database) do |db|
          db.from(Sequel.lit("information_schema.TABLES"))
            .select(Sequel.lit("SUM(data_length + index_length) AS size"))
            .where(Sequel.lit("table_schema = ?", database.database_name))
            .first[:size]
        end
      end

      database.base_migration.update(database_size: db_size)
    end

    change_column_null :base_migrations, :database_size, false
  end

  def down
    remove_column :base_migrations, :database_size
    add_column :base_migrations, :database_size, :string, :null => true

    databases = PowerbaseDatabase.all
    databases.each do |database|
      db_size = nil

      case database.adapter
      when "postgresql"
        db_size = sequel_connect(database) do |db|
          db.select(Sequel.lit('pg_size_pretty(pg_database_size(current_database())) AS size'))
            .first[:size]
        end
      when "mysql2"
        db_size = sequel_connect(database) do |db|
          db.from(Sequel.lit("information_schema.TABLES"))
            .select(Sequel.lit("concat(sum(data_length + index_length) / 1024, \" kB\") as size"))
            .where(Sequel.lit("table_schema = ?", database.database_name))
            .first[:size]
        end
      end

      database.base_migration.update(database_size: db_size)
    end

    change_column_null :base_migrations, :database_size, false
  end
end
