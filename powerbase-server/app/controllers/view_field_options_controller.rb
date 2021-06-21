class ViewFieldOptionsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:view_id).value(:integer)
  end

  # GET /views/:view_id/fields
  def index
    @view_fields = ViewFieldOption.where(table_view_id: safe_params[:view_id]).order(:order)
    render json: @view_fields.map {|item| format_json(item)}
  end

  private
    def format_json(view_field)
      {
        id: view_field.id,
        name: view_field.powerbase_field.name,
        description: view_field.powerbase_field.description,
        default_value: view_field.powerbase_field.default_value,
        is_primary_key: view_field.powerbase_field.is_primary_key,
        is_nullable: view_field.powerbase_field.is_nullable,
        order: view_field.order,
        is_frozen: view_field.is_frozen,
        is_hidden: view_field.is_hidden,
        view_id: view_field.table_view_id,
        table_id: view_field.powerbase_field.powerbase_table_id,
        field_type_id: view_field.powerbase_field.powerbase_field_type_id,
        created_at: view_field.created_at,
        updated_at: view_field.updated_at,
      }
    end
end
