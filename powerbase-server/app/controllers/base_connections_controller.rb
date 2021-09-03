class BaseConnectionsController < ApplicationController
  # before_action :authorize_access_request!

  schema(:index) do
    required(:database_id).value(:integer)
  end

  schema(:create) do
    required(:table_id).value(:integer)
    optional(:columns).value(:array)
    required(:referenced_table_id).value(:integer)
    optional(:referenced_columns).value(:array)
  end

  schema(:table_connections) do
    required(:table_id).value(:integer)
  end

  # GET /database/:database_id/connections
  def index
    @connections = BaseConnection.where(powerbase_database_id: safe_params[:database_id])
    render json: @connections.map {|item| format_json(item)}
  end

  # POST /database/:database_id/connections
  def create
    existing_connection = BaseConnection.find_by(
      name: safe_params[:name],
      powerbase_table_id: safe_params[:table_id],
      powerbase_database_id: safe_params[:database_id],
    )

    if existing_connection
      render json: { errors: ["Connection with name of \"#{safe_params[:name]}\" already exists for base with id of #{safe_params[:database_id]}"] }, status: :unprocessable_entity
      return;
    end

    table = PowerbaseTable.find(safe_params[:table_id])
    referenced_table = PowerbaseTable.find(safe_params[:referenced_table_id])

    if !table || !referenced_table
      errors = []
      errors.push("Couldn't find table with id of #{safe_params[:table_id]}") if !table
      errors.push("Couldn't find referenced table with id of #{safe_params[:referenced_table_id]}") if !referenced_table
      render json: { errors: errors }, status: :unprocessable_entity
      return;
    end

    @connection = BaseConnection.new
    @connection.name = safe_params[:name] || "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{safe_params[:columns].join("_")}"
    @connection.powerbase_database_id = table.powerbase_database_id
    @connection.powerbase_table_id = table.id
    @connection.columns = safe_params[:columns]
    @connection.referenced_database_id = referenced_table.powerbase_database_id
    @connection.referenced_table_id = referenced_table.id
    @connection.referenced_columns = safe_params[:referenced_columns]

    if !@connection.save
      render json: @connection.errors, status: :unprocessable_entity
    else
      render json: format_json(@connection)
    end
  end

  # GET /tables/:table_id/connections
  def table_connections
    @connections = BaseConnection.where(powerbase_table_id: safe_params[:table_id])
    render json: @connections.map {|item| format_json(item)}
  end

  private
    def format_json(connection)
      {
        id: connection.id,
        name: connection.name,
        columns: connection.columns,
        referenced_columns: connection.referenced_columns,
        table_id: connection.powerbase_table_id,
        database_id: connection.powerbase_database_id,
        referenced_table_id: connection.referenced_table_id,
        referenced_database_id: connection.referenced_database_id,
      }
    end
end
