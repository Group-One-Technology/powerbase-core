class PowerbaseDatabasesController < ApplicationController
  before_action :authorize_access_request!

  schema(:show, :clear_logs) do
    required(:id).value(:integer)
  end

  schema(:update) do
    required(:id).value(:integer)
    required(:name).value(:string)
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    required(:color).value(:string)
  end

  schema(:connect) do
    optional(:name).value(:string)
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:adapter).value(:string)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:color).value(:string)
    optional(:is_turbo).value(:bool)
    optional(:connection_string).value(:string)
  end

  # GET /databases/
  def index
    @databases = PowerbaseDatabase.where(user_id: current_user.id)

    render json: @databases.map {|item| format_json(item)}
  end

  # GET /databases/:id
  def show
    @database = PowerbaseDatabase.find(safe_params[:id])

    if @database
      render json: format_json(@database)
    end
  end

  # PUT /databases/:id
  def update
    options = safe_params.output
    @database = PowerbaseDatabase.find(safe_params[:id])

    if !@database
      render status: :not_found
      return
    end

    options[:adapter] = @database.adapter
    options[:is_turbo] = @database.is_turbo
    is_connection_updated = false

    if options[:name] != @database.name
      @database.name = options[:name]
      @existing_database = PowerbaseDatabase.find_by(name: options[:name], user_id: current_user.id)

      if @existing_database && @existing_database.id != @database.id
        render json: { is_existing: true, database: format_json(@database) }
        return
      end
    end

    if options[:username]&.length > 1 && options[:password]&.length > 1
      is_connection_updated = true

      begin
        Powerbase.connect(options)
      rescue => exception
        render json: { connected: false, exception: exception }
        return
      end

      if !Powerbase.connected?
        Powerbase.disconnect
        render json: { connected: false, database: format_json(@database) }
        return
      end
    end

    @database.database_name = options[:database]
    @database.color = options[:color]
    @database.connection_string = Powerbase.connection_string if is_connection_updated
    if !@database.save
      Powerbase.disconnect if is_connection_updated
      render json: @database.errors, status: :unprocessable_entity
      return;
    end

    Powerbase.disconnect if is_connection_updated
    render json: { connected: true, database: format_json(@database) }
  end

  # POST /databases/connect
  def connect
    options = safe_params.output

    @database = PowerbaseDatabase.find_by(name: options[:name], user_id: current_user.id)

    if @database
      render json: { is_existing: true, database: format_json(@database) }
      return
    end

    begin
      Powerbase.connect(options)
    rescue => exception
      render json: { connected: false }
      return;
    end

    @database = PowerbaseDatabase.new({
      name: options[:name],
      database_name: Powerbase.database,
      connection_string: Powerbase.connection_string,
      adapter: Powerbase.adapter,
      is_migrated: false,
      color: options[:color],
      is_turbo: options[:is_turbo],
      user_id: current_user.id,
    })

    if !Powerbase.connected?
      Powerbase.disconnect
      render json: { connected: false, database: format_json(@database) }
      return
    elsif !@database.save
      Powerbase.disconnect
      render json: @database.errors, status: :unprocessable_entity
      return
    end

    case Powerbase.adapter
    when "postgresql"
      @db_size = Powerbase.DB
        .select(Sequel.lit('pg_size_pretty(pg_database_size(current_database())) AS size'))
        .first[:size]
    when "mysql2"
      @db_size = Powerbase.DB
        .from(Sequel.lit("information_schema.TABLES"))
        .select(Sequel.lit("concat(sum(data_length + index_length) / 1024, \" kB\") as size"))
        .where(Sequel.lit("ENGINE=('MyISAM' || 'InnoDB' ) AND table_schema = ?", Powerbase.database))
        .group(:table_schema)
        .first[:size]
    end

    if !@database.is_migrated
      @base_migration = BaseMigration.find_by(powerbase_database_id: @database.id) || BaseMigration.new
      @base_migration.powerbase_database_id = @database.id
      @base_migration.database_size = @db_size || "0 kB"
      @base_migration.retries = 0
      @base_migration.save

      PowerbaseDatabaseMigrationJob.perform_later(@database.id)
    end

    Powerbase.disconnect
    render json: { connected: true, database: format_json(@database), db_size: @db_size }
  end

  # PUT /databases/:id/clear_logs
  def clear_logs
    @database = PowerbaseDatabase.find(safe_params[:id])

    if @database.base_migration.update(logs: { errors: [] })
      render status: :no_content
    else
      render json: @database.base_migration.errors, status: :unprocessable_entity
    end
  end

  private
    def format_json(database)
      {
        id: database.id,
        user_id: database.user_id,
        adapter: database.adapter,
        name: database.name,
        database_name: database.database_name,
        description: database.description,
        color: database.color,
        is_migrated: database.is_migrated,
        is_turbo: database.is_turbo,
        created_at: database.created_at,
        updated_at: database.updated_at,
        total_tables: database.powerbase_tables.length,
        logs: database.base_migration.logs,
      }
    end
end
