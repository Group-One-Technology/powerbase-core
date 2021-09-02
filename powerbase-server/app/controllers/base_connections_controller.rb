class BaseConnectionsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:database_id).value(:integer)
  end

  schema(:table_connections) do
    required(:table_id).value(:integer)
  end

  # GET /database/:database_id/connections
  def index
    @connections = BaseConnection.where(powerbase_database_id: safe_params[:database_id])
    render json: @connections.map {|item| format_json(item)}
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
