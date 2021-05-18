class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_database, only: [:index]

  schema(:index) do
    required(:database_id).value(:string)
  end

  # GET /databases/:database_id/tables
  def index
    render json: { migrated: @database.is_migrated, tables: @database.powerbase_tables }
  end

  private
    def set_database
      @database = PowerbaseDatabase.find(safe_params[:database_id])

      if !@database
        raise StandardError.new("Must establish a database connection first to execute this action.")
      end
    end
end
