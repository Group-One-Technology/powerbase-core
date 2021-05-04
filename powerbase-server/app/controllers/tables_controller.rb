class TablesController < ApplicationController
  # GET /bases/tables
  def index
    render json: { tables: Powerbase.DB.tables }
  end
end
