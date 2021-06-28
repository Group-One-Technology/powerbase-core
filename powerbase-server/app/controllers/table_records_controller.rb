class TableRecordsController < ApplicationController
  # before_action :authorize_access_request!

  schema(:index) do
    required(:id).value(:integer)
    optional(:filters)
    optional(:page).value(:integer)
    optional(:limit).value(:integer)
  end

  # PUT /tables/:id/records
  def index
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:id])
    records = model.get({ page: safe_params[:page], limit: safe_params[:limit], filters: safe_params[:filters] })
    model.disconnect

    render json: records
  end
end
