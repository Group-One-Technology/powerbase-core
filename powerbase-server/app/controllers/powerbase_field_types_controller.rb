class PowerbaseFieldTypesController < ApplicationController
  before_action :authorize_access_request!

  # GET /field_types
  def index
    @field_types = PowerbaseFieldType.all
    render json: @field_types.map {|item| format_json(item)}
  end

  private
    def format_json(field_type)
      {
        id: field_type.id,
        name: field_type.name,
        description: field_type.description,
        data_type: field_type.data_type,
        created_at: field_type.created_at,
        updated_at: field_type.updated_at,
      }
    end
end
