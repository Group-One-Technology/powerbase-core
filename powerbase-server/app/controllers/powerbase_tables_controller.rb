class PowerbaseTablesController < ApplicationController
  # before_action :authorize_access_request!
  before_action :set_database, only: [:index]

  schema(:index) do
    required(:database_id).value(:string)
  end

  schema(:show) do
    required(:id).value(:string)
  end

  # GET /databases/:database_id/tables
  def index
    render json: { migrated: @database.is_migrated, tables: @database.powerbase_tables }
  end

  # GET /tables/:id
  def show
    @table = PowerbaseTable.includes(:powerbase_database).find(safe_params[:id])
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
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
        database: {
          id: database.id,
          user_id: database.user_id,
          adapter: database.adapter,
          name: database.name,
          description: database.description,
          color: database.color,
          is_migrated: database.is_migrated,
          created_at: database.created_at,
          updated_at: database.updated_at,
        }
      }
    end
end
