class TableRecordsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:id).value(:integer)
    optional(:filters)
  end

  # PUT /tables/:id/records
  def index
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:id])
    records = safe_params[:filters] ? model.filter(safe_params[:filters]) : model.all
    model.disconnect

    render json: records
  end
end
