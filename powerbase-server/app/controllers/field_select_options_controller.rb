class FieldSelectOptionsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:field_id).value(:integer)
  end

  # GET /fields/:field_id/select_options
  def index
    @select_option = FieldSelectOption.find_by(powerbase_field_id: safe_params[:field_id])
    render json: format_json(@select_option)
  end

  private
    def format_json(option)
      {
        id: option.id,
        name: option.name,
        values: option.values,
        field_id: option.powerbase_field_id,
      }
    end
end
