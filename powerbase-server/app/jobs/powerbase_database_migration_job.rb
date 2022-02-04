class PowerbaseDatabaseMigrationJob < ApplicationJob
  include SequelHelper

  queue_as :default

  # * Migrates the given remote database.
  def perform(database_id)
    @database = PowerbaseDatabase.find(database_id);
    @base_migration = BaseMigration.find_by(powerbase_database_id: database_id)

    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    @base_migration.logs["errors"] = [] if !@base_migration.logs["errors"]

    if !single_line_text_field
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "There is no 'single line text' field in the database.",
      })
      @base_migration.save
      return
    elsif !@database
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "Database with id of #{database_id} could not be found.",
      })
      @base_migration.save
      return
    elsif @database.migrated?
      @base_migration.logs["errors"].push({
        type: "Status",
        error: "Database with id of #{database_id} has already been migrated.",
      })
      @base_migration.save
      return
    end

    if !@base_migration
      @base_migration = BaseMigration.new
      @base_migration.powerbase_database_id = @database.id

      case @database.adapter
      when "postgresql"
        @db_size = sequel_connect(@database) do |db|
          db.select(Sequel.lit('pg_database_size(current_database()) AS size'))
            .first[:size]
        end
      when "mysql2"
        @db_size = sequel_connect(@database) do |db|
          db.from(Sequel.lit("information_schema.TABLES"))
            .select(Sequel.lit("SUM(data_length + index_length) AS size"))
            .where(Sequel.lit("table_schema = ?", @database.database_name))
            .first[:size]
        end
      end

      @base_migration.retries = 0
      @base_migration.database_size = @db_size || 0
      @base_migration.save
    end

    if @base_migration.start_time
      @base_migration.retries += 1
    else
      @base_migration.start_time = Time.now
    end

    @base_migration.save
    @database.sync!(true)
  end
end