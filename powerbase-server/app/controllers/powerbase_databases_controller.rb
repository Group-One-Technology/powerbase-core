class PowerbaseDatabasesController < ApplicationController
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
    @databases = PowerbaseDatabase.all

    render json: @databases
  end

  # POST /databases/connect
  def connect
    options = safe_params.output

    Powerbase.connect(options)
    @database = nil

    if Powerbase.connected?
      @database = PowerbaseDatabase.find_by(name: Powerbase.database)

      if !@database
        @database = PowerbaseDatabase.new({
          name: Powerbase.database,
          connection_string: Powerbase.connection_string,
          adapter: Powerbase.adapter,
          is_migrated: false,
          color: options[:color]
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
end
