class TablesController < ApplicationController
  # GET /databases/tables
  def index
    render json: { tables: Powerbase.DB.tables }
  end
end
