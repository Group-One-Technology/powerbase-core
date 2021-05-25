class PowerbaseDatabasesController < ApplicationController
  before_action :authorize_access_request!

  schema(:show) do
    required(:id).value(:integer)
  end

  schema(:connect) do
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:adapter).value(:string)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:color).value(:string)
    optional(:connection_string).value(:string)
  end

  # GET /databases/
  def index
    @databases = PowerbaseDatabase.where(user_id: current_user.id)

    render json: @databases.map {|item| format_json(item)}
  end

  # GET /databases/:id
  def show
    puts safe_params.output
    @database = PowerbaseDatabase.find(safe_params[:id])

    if @database
      render json: format_json(@database)
    end
  end

  # POST /databases/connect
  def connect
    options = safe_params.output

    Powerbase.connect(options)
    @database = nil

    if Powerbase.connected?
      @database = PowerbaseDatabase.find_by(name: Powerbase.database, user_id: current_user.id)

      if !@database
        @database = PowerbaseDatabase.new({
          name: Powerbase.database,
          connection_string: Powerbase.connection_string,
          adapter: Powerbase.adapter,
          is_migrated: false,
          color: options[:color],
          user_id: current_user.id,
        })

        if !@database.save
          render json: @database.errors, status: :unprocessable_entity
          return;
        end
      end

      if !@database.is_migrated
        PowerbaseDatabaseMigrationJob.perform_later(@database.id, Powerbase.adapter, Powerbase.connection_string)
      end
    end

    render json: { connected: Powerbase.connected?, database: @database }
  end

  private
    def format_json(database)
      {
        id: database.id,
        user_id: database.user_id,
        adapter: database.adapter,
        name: database.name,
        description: database.description,
        color: database.color,
        is_migrated: database.is_migrated,
        created_at: database.created_at,
        updated_at: database.updated_at,
        total_tables: database.powerbase_tables.length,
      }
    end
end
