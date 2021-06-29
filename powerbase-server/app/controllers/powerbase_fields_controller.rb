class PowerbaseFieldsController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_table, only: [:index]

  schema(:index) do
    required(:id).value(:integer)
  end

  # GET /tables/:id/fields
  def index
    render json: @table.powerbase_fields.map {|item| format_json(item)}
  end

  private
    def set_table
      @table = PowerbaseTable.find(safe_params[:id])

      if !@table
        raise StandardError.new("Could not find table with id of '#{safe_params[:id]}'")
      end
    end

    def format_json(field)
      {
        id: field.id,
        name: field.name,
        description: field.description,
        default_value: field.default_value,
        is_primary_key: field.is_primary_key,
        is_nullable: field.is_nullable,
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: field.created_at,
        updated_at: field.updated_at,
      }
    end
end
