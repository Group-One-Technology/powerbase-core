class PowerbaseFieldsController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_field_access, except: [:index]

  schema(:index) do
    required(:table_id).value(:integer)
  end

  schema(:alias) do
    required(:id).value(:integer)
    required(:alias).value(:string)
  end

  schema(:field_type) do
    required(:id).value(:integer)
    required(:field_type_id).value(:string)
  end

  schema(:options) do
    required(:id).value(:integer)
    required(:options)
  end

  schema(:set_as_pii, :unset_as_pii) do
    required(:id).value(:integer)
  end

  # GET /tables/:id/fields
  def index
    current_user.can?(:view_table, safe_params[:table_id])
    @fields = PowerbaseField.where(powerbase_table_id: safe_params[:table_id])
    render json: @fields.map {|item| format_json(item)}
  end

  # PUT /fields/:id/alias
  def alias
    if @field.update(alias: safe_params[:alias])
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/field_type
  def field_type
    @field_type = PowerbaseFieldType.find(safe_params[:field_type_id])

    if @field.powerbase_field_type.data_type != @field_type.data_type
      render json: { error: "Could not convert field of type '#{@field.powerbase_field_type.name}' to '#{@field_type.name}'" }, status: :unprocessable_entity
      return
    end

    if @field.db_type.include?("uuid") || @field.db_type.include?("int")
      render json: { error: "Could not convert field with db_type of '#{@field.db_type}' to '#{@field_type.name}'" }, status: :unprocessable_entity
      return
    end

    if @field.update(powerbase_field_type_id: @field_type.id, options: {})
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/options
  def options
    if @field.update(options: safe_params[:options])
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/set_as_pii
  def set_as_pii
    if @field.update(is_pii: true)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/unset_as_pii
  def unset_as_pii
    if @field.update(is_pii: false)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  private
    def check_field_access
      @field = PowerbaseField.find(safe_params[:id])
      raise NotFound.new("Could not find field with id of #{safe_params[:id]}") if !@field
      current_user.can?(:manage_field, @field)
    end

    def format_json(field)
      {
        id: field.id,
        name: field.name,
        alias: field.alias,
        description: field.description,
        default_value: field.default_value,
        is_primary_key: field.is_primary_key,
        is_nullable: field.is_nullable,
        is_pii: field.is_pii,
        options: field.options,
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: field.created_at,
        updated_at: field.updated_at,
      }
    end
end
