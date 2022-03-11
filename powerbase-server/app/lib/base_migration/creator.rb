class BaseMigration::Creator
  include SequelHelper

  attr_accessor :migration, :database, :errors

  def initialize(database, database_size = nil)
    query = Databases::MetaQuery.new(database) if database_size == nil

    @migration =  BaseMigration.find_by(powerbase_database_id: database.id) ||
      BaseMigration.new({
        powerbase_database_id: database.id,
        retries: 0,
        database_size: database_size != nil ? database_size : query.database_size || 0,
      })
  end

  def save
    if !@migration.save
      @errors = @migration.errors
      false
    end
  end
end