class PowerbaseDatabaseMigrationJob < ApplicationJob
  queue_as :default

  DEFAULT_PAGE_SIZE = 40
  DEFAULT_PAGE_SIZE_TURBO = 200

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
    elsif @database.is_migrated
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
        @db_size = connect(@database) {|db|
          db.select(Sequel.lit('pg_size_pretty(pg_database_size(current_database())) AS size'))
            .first[:size]
        }
      when "mysql2"
        @db_size = connect(@database) {|db|
          db.from(Sequel.lit("information_schema.TABLES"))
          .select(Sequel.lit("concat(sum(data_length + index_length) / 1024, \" kB\") as size"))
          .where(Sequel.lit("ENGINE=('MyISAM' || 'InnoDB' ) AND table_schema = ?", @database.database_name))
          .group(:table_schema)
          .first[:size]
        }
      end

      @base_migration.retries = 0
      @base_migration.database_size = @db_size || "0 kB"
      @base_migration.save
    end

    if @base_migration.start_time
      @base_migration.retries += 1
    else
      @base_migration.start_time = Time.now
    end

    @database.sync!(true)
    @database.update(is_migrated: true)
  end

  private
    def connect(db, &block)
      Powerbase.connect({
        adapter: db.adapter,
        connection_string: db.connection_string,
        is_turbo: db.is_turbo,
      }, &block)
    end
end