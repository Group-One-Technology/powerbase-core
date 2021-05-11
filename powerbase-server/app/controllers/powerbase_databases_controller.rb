class PowerbaseDatabasesController < ApplicationController
  schema(:connect) do
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:adapter).value(:string)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
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
    options[:adapter] = options[:adapter] || "postgresql"

    Powerbase.connect(options)
    @database = nil

    if Powerbase.connected?
      @database = PowerbaseDatabase.find_by(name: options[:database])

      if !@database
        @database = PowerbaseDatabase.new({
          name: options[:database],
          connection_string: Powerbase.connection_string,
          database_type: options[:adapter],
          is_migrated: false,
        })

        if !@database.save
          render json: @database.errors, status: :unprocessable_entity
          return;
        end
      end

      if !@database.is_migrated
        PowerbaseTableMigrationJob.perform_later(@database.id, Powerbase.connection_string)
      end
    end

    render json: { connected: Powerbase.connected?, database: @database }
  end
end
