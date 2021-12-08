class Databases::Creator
  include SequelHelper

  attr_accessor :database, :errors, :db_size

  def initialize(database)
    @database = PowerbaseDatabase.new({
      name: database[:name],
      database_name: database[:database_name],
      connection_string: database[:connection_string],
      adapter: database[:adapter],
      is_migrated: database[:is_migrated],
      color: database[:color],
      is_turbo: database[:is_turbo],
      user_id: database[:user_id],
    })
    @errors = nil
    @db_size = nil
  end

  def database_migration
    case @database.adapter
    when "postgresql"
      @db_size = sequel_connect(@database) do |db|
        db.select(Sequel.lit('pg_size_pretty(pg_database_size(current_database())) AS size'))
          .first[:size]
      end
    when "mysql2"
      @db_size = sequel_connect(@database) do |db|
        db.from(Sequel.lit("information_schema.TABLES"))
          .select(Sequel.lit("concat(sum(data_length + index_length) / 1024, \" kB\") as size"))
          .where(Sequel.lit("ENGINE=('MyISAM' || 'InnoDB' ) AND table_schema = ?", Powerbase.database))
          .group(:table_schema)
          .first[:size]
      end
    end

    if !@database.is_migrated
      migration = BaseMigration.find_by(powerbase_database_id: @database.id) || BaseMigration.new
      migration.powerbase_database_id = @database.id
      migration.database_size = @db_size || "0 kB"
      migration.retries = 0
      migration.save

      PowerbaseDatabaseMigrationJob.perform_later(@database.id)
    end
  end

  def database
    @database
  end

  def errors
    @errors
  end

  def db_size
    @db_size
  end

  def save
    if @database.save
      database_migration
    else
      @errors = @database.errors
      false
    end
  end
end