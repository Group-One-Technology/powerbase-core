class TableRecordsController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_table, only: [:index]

  schema(:index) do
    required(:table_id).value(:integer)
  end

  # GET /tables/:table_id/records
  def index
    Powerbase.connect({
      adapter: @table.powerbase_database.adapter,
      connection_string: @table.powerbase_database.connection_string,
    })

    render json: Powerbase.DB.from(@table.name).all
  end

  private
    def set_table
      @table = PowerbaseTable.includes(:powerbase_database).find(safe_params[:table_id])

      if !@table
        raise StandardError.new("Could not find table with id of '#{safe_params[:table_id]}'")
      end
    end
end
