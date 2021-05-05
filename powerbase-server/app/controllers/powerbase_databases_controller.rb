class PowerbaseDatabasesController < ApplicationController
  schema(:connect) do
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:connection_string).value(:string)
  end

  # GET /groups/
  def index
    @databases = PowerbaseDatabase.all

    render json: @databases
  end

  # POST /groups/connect
  def connect
    options = safe_params.output
    options[:adapter] = "postgres"

    @remote_db = Powerbase.connect(options)
    @database = nil

    if @remote_db.test_connection
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

      if !@group.is_migrated
        PowerTableMigrationJob.perform_later(@group.id, Powerbase.connection_string)
      end
    end

    render json: { connected: @remote_db.test_connection, database: @database }
  end
end
