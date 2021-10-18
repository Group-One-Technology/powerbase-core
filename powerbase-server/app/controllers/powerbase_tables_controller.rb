class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_database, only: [:index]
  before_action :set_table, only: [:show, :update, :update_default_view]

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
    render json: {
      migrated: @database.is_migrated,
      tables: @database.powerbase_tables.order(order: :asc).map {|item| format_json(item)}
    }
  end

  # GET /tables/:id
  def show
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
    def set_database
      @database = PowerbaseDatabase.find(safe_params[:database_id])

      if !@database
        raise StandardError.new("Must establish a database connection first to execute this action.")
      end
    end

    def set_table
      @table = PowerbaseTable.find(safe_params[:id])
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
        has_primary_key: table.has_primary_key?,
        in_synced: table.in_synced?,
      }
    end
end
