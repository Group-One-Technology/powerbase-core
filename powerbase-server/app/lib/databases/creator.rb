class Databases::Creator
  include SequelHelper

  attr_accessor :database, :errors, :db_size

  def initialize(database)
    @database = PowerbaseDatabase.new({
      name: database[:name],
      database_name: database[:database_name],
      connection_string: database[:connection_string],
      adapter: database[:adapter],
      color: database[:color],
      is_turbo: database[:is_turbo],
      user_id: database[:user_id],
    })
    @errors = nil
    @db_size = nil
  end

  def database_migration
    if !@database.migrated?
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
    if @database.mysql2?
      raise StandardError.new "Couldn't connect to \"#{@database.name}\". MySQL databases are currently not supported yet."
    end

    # Get database size in kilobytes
    case @database.adapter
    when "postgresql"
      @db_size = sequel_connect(@database) do |db|
        db.select(Sequel.lit('ROUND(pg_database_size(current_database()) / 1024, 2) AS size'))
          .first[:size]
      end
    when "mysql2"
      @db_size = sequel_connect(@database) do |db|
        db.from(Sequel.lit("information_schema.TABLES"))
          .select(Sequel.lit("ROUND(SUM(data_length + index_length) / 1024, 2) AS size"))
          .where(Sequel.lit("table_schema = ?", @database.database_name))
          .first[:size]
      end
    end

    if @db_size > 2.gigabytes
      raise StandardError.new "Connecting to a database with over 2GB of data is currently restricted."
    end

    if @database.save
      database_migration
    else
      @errors = @database.errors
      false
    end
  end
end