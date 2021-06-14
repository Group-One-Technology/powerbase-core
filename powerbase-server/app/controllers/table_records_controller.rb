class TableRecordsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:table_id).value(:integer)
  end

  # GET /tables/:table_id/records
  def index
    model = Powerbase::Model.new(safe_params[:table_id])

    render json: model.records
  end
end
