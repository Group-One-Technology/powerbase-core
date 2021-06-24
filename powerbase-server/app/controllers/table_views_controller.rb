class TableViewsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:table_id).value(:integer)
  end

  schema(:show) do
    required(:id).value(:integer)
  end

  # GET /tables/:table_id/views
  def index
    @views = TableView.where(powerbase_table_id: safe_params[:table_id])
    render json: @views.map {|item| format_json(item)}
  end

  # GET /views/:id
  def show
    @view = TableView.find(safe_params[:id])
    render json: format_json(@view)
  end

  private
    def format_json(view)
      {
        id: view.id,
        name: view.name,
        table_id: view.powerbase_table_id,
        created_at: view.created_at,
        updated_at: view.updated_at,
      }
    end
end
