class BaseConnectionsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:database_id).value(:integer)
  end

  schema(:create) do
    required(:table_id).value(:integer)
    optional(:columns).value(:array)
    required(:referenced_table_id).value(:integer)
    optional(:referenced_columns).value(:array)
  end

  schema(:update) do
    required(:id).value(:integer)
    required(:name).value(:string)
    required(:table_id).value(:integer)
    optional(:columns).value(:array)
    required(:referenced_table_id).value(:integer)
    optional(:referenced_columns).value(:array)
  end

  schema(:destroy) do
    required(:id).value(:integer)
  end

  schema(:table_connections, :referenced_table_connections) do
    required(:table_id).value(:integer)
  end

  # GET /database/:database_id/connections
  def index
    @connections = BaseConnection.where(powerbase_database_id: safe_params[:database_id])
    tables = get_related_tables(@connections)

    render json: @connections.map {|item| format_json(item, tables)}
  end

  # POST /database/:database_id/connections
  def create
    table = PowerbaseTable.find(safe_params[:table_id])
    referenced_table = PowerbaseTable.find(safe_params[:referenced_table_id])

    if !table || !referenced_table
      errors = []
      errors.push("Couldn't find table with id of #{safe_params[:table_id]}") if !table
      errors.push("Couldn't find referenced table with id of #{safe_params[:referenced_table_id]}") if !referenced_table
      render json: { errors: errors }, status: :unprocessable_entity
      return;
    end

    connection_name = safe_params[:name] || "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{safe_params[:columns].join("_")}"

    existing_connection = BaseConnection.find_by(name: connection_name)

    if existing_connection
      render json: { errors: ["Connection with name of \"#{connection_name}\" already exists for base with id of #{table.powerbase_database_id}"] }, status: :unprocessable_entity
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

    if @connection.save
      render json: format_json(@connection, [table, referenced_table])
    else
      render json: @connection.errors, status: :unprocessable_entity
    end
  end

  # PUT /connections/:id
  def update
    @connection = BaseConnection.find(safe_params[:id])

    table = PowerbaseTable.find(safe_params[:table_id])
    referenced_table = PowerbaseTable.find(safe_params[:referenced_table_id])

    if !table || !referenced_table
      errors = []
      errors.push("Couldn't find table with id of #{safe_params[:table_id]}") if !table
      errors.push("Couldn't find referenced table with id of #{safe_params[:referenced_table_id]}") if !referenced_table
      render json: { errors: errors }, status: :unprocessable_entity
      return;
    end

    @connection.name = if @connection.name === safe_params[:name]
        "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{safe_params[:columns].join("_")}"
      else
        safe_params[:name]
      end
    @connection.powerbase_database_id = table.powerbase_database_id
    @connection.powerbase_table_id = table.id
    @connection.columns = safe_params[:columns]
    @connection.referenced_database_id = referenced_table.powerbase_database_id
    @connection.referenced_table_id = referenced_table.id
    @connection.referenced_columns = safe_params[:referenced_columns]

    if @connection.save
      render json: format_json(@connection, [table, referenced_table])
    else
      render json: @connection.errors, status: :unprocessable_entity
    end
  end

  # DELETE /connections/:id
  def destroy
    @connection = BaseConnection.find(safe_params[:id])
    @connection.destroy
  end

  # GET /tables/:table_id/connections
  def table_connections
    @connections = BaseConnection.where(powerbase_table_id: safe_params[:table_id])
    tables = get_related_tables(@connections)

    render json: @connections.map {|item| format_json(item, tables)}
  end

  # GET /tables/:table_id/referenced_connections
  def referenced_table_connections
    @connections = BaseConnection.where(referenced_table_id: safe_params[:table_id])
    tables = get_related_tables(@connections)

    render json: @connections.map {|item| format_json(item, tables)}
  end

  private
    def get_related_tables(connections)
      table_ids = connections.map {|item| [item.powerbase_table_id, item.referenced_table_id] }.flatten
      PowerbaseTable.where(id: table_ids)
    end

    def format_json(connection, tables)
      table = tables&.find {|table| table.id == connection.powerbase_table_id }
      referenced_table = tables&.find {|table| table.id == connection.referenced_table_id }

      {
        id: connection.id,
        name: connection.name,
        columns: connection.columns,
        referenced_columns: connection.referenced_columns,
        table_id: connection.powerbase_table_id,
        table: table ? table_format_json(table) : nil,
        database_id: connection.powerbase_database_id,
        referenced_table_id: connection.referenced_table_id,
        referenced_table: referenced_table ? table_format_json(referenced_table) : nil,
        referenced_database_id: connection.referenced_database_id,
        is_auto_linked: connection.is_auto_linked,
        is_constraint: connection.is_constraint,
      }
    end

    # Reference: powerbase_tables_controller
    def table_format_json(table)
      {
        id: table.id,
        name: table.name,
        alias: table.alias,
        description: table.description,
        default_view_id: table.default_view_id,
        page_size: table.page_size,
        is_migrated: table.is_migrated,
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
        database_name: table.powerbase_database.name,
      }
    end
end
