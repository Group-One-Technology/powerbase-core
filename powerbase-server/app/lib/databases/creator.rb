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
      enable_magic_data: !!database[:enable_magic_data],
      is_created: database[:is_created],
      is_superuser: database[:is_superuser],
      user_id: database[:user_id],
    })
    @errors = nil
    @db_size = nil
  end

  def database_migration
    if !@database.migrated?
      migration_creator = BaseMigration::Creator.new @database, @db_size
      migration_creator.save
      DatabaseMigrationWorker.perform_async(@database.id)
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
      @errors = { error: "Couldn't connect to \"#{@database.name}\". MySQL databases are currently not supported yet." }
      return false
    end

    query = Databases::MetaQuery.new @database
    @db_size = query.database_size || 0

    if @database.save
      database_migration
    else
      @errors = @database.errors
      false
    end
  end
end