class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_table_access, only: [:update, :update_default_view]

  schema(:index) do
    required(:database_id).value(:string)
  end

  schema(:show, :update) do
    required(:id).value(:string)
    optional(:alias).value(:string)
  end

  schema(:update_tables) do
    required(:database_id)
    required(:tables)
  end

  schema(:update_default_view) do
    required(:id).value(:string)
    required(:view_id)
  end

  # GET /databases/:database_id/tables
  def index
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database

    render json: {
      migrated: @database.is_migrated,
      tables: @database.powerbase_tables.order(order: :asc).map {|item| format_json(item)}
    }
  end

  # GET /tables/:id
  def show
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    render json: format_json(@table)
  end

  # PUT /tables/:id/update
  def update
    if @table.update(safe_params)
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # PUT /databases/:database_id/tables/update
  def update_tables
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    can?(:manage_base, @database)

    safe_params[:tables].each_with_index do |table, index|
      @table = PowerbaseTable.find(table[:id])
      @table.update(alias: table[:alias], order: index)
    end

    render status: :no_content
  end

  # PUT tables/:id/update_default_view
  def update_default_view
    if @table.update(default_view_id: safe_params[:view_id])
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  private
    def check_table_access
      @table = PowerbaseTable.find(safe_params[:id])
      raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
      can?(:manage_table, @table)
    end

    def format_json(table)
      {
        id: table.id,
        name: table.name,
        alias: table.alias,
        description: table.description,
        default_view_id: table.default_view_id,
        page_size: table.page_size,
        order: table.order,
        is_migrated: table.is_migrated,
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
      }
    end
end
