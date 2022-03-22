class DatabaseMigrationWorker < ApplicationWorker
  sidekiq_options queue: :critical
  sidekiq_options lock: :until_and_while_executing,
                  on_conflict: { client: :log, server: :reject }

  attr_accessor :database, :base_migration

  def perform(database_id)
    super
    Sentry.set_context("database", { database_id: database_id })

    @database = PowerbaseDatabase.find(database_id);
    raise StandardError.new("Could not find database with id of '#{database_id}'")if !@database
    @base_migration = @database.base_migration

    initialize_logs
    sync_database
  end

  def initialize_logs
    if !@base_migration
      migration_creator = BaseMigration::Creator.new @database
      if migration_creator.save
        @base_migration = migration_creator.migration
      end
    end

    single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")

    if !single_line_text_field
      @base_migration.write_error_logs!({
        type: "Status",
        error: "There is no 'single line text' field in the database.",
      })
      return
    elsif @database.migrated?
      @base_migration.write_error_logs!({
        type: "Status",
        error: "Database with id of #{database_id} has already been migrated.",
      })
      return
    end

    if @base_migration.start_time
      @base_migration.retries += 1
    else
      @base_migration.start_time = Time.now
    end

    @base_migration.save
  end

  def sync_database
    @database.sync!(true)
  end
end