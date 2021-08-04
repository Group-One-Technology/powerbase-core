class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_database, only: [:index]

  schema(:index) do
    required(:database_id).value(:string)
  end

  schema(:show) do
    required(:id).value(:string)
  end

  # GET /databases/:database_id/tables
  def index
    render json: {
      migrated: @database.is_migrated,
      tables: @database.powerbase_tables.map {|item| format_json(item)}
    }
  end

  # GET /tables/:id
  def show
    @table = PowerbaseTable.find(safe_params[:id])
    render json: format_json(@table)
  end

  private
    def set_database
      @database = PowerbaseDatabase.find(safe_params[:database_id])

      if !@database
        raise StandardError.new("Must establish a database connection first to execute this action.")
      end
    end

    def format_json(table)
      database = table.powerbase_database

      {
        id: table.id,
        name: table.name,
        description: table.description,
        default_view_id: table.default_view_id,
        page_size: table.page_size,
        is_migrated: table.is_migrated,
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
      }
    end
end
