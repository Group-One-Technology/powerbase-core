class PowerbaseFieldsController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_table, only: [:index]

  schema(:index) do
    required(:table_id).value(:integer)
  end

  # schema(:add) do
  #   required(:table_id).value(:integer)
  # end

  schema(:alias) do
    required(:id).value(:integer)
    required(:alias).value(:string)
  end

  schema(:set_as_pii, :unset_as_pii) do
    required(:id).value(:integer)
  end

  # GET /tables/:id/fields
  def index
    render json: @table.powerbase_fields.map {|item| format_json(item)}
  end

  # POST /tables/:id/field
  def add
    options = construct_field(params)
    field_params = options[:field]
    view_field_params = options[:view_field]
    @field = PowerbaseField.create(field_params)
    if @field
      view_field_params[:powerbase_field_id] = @field.id
      view_field = ViewFieldOption.create(view_field_params)
      puts view_field
      render json: format_json(@field)
    end
  end

  # GET /field/:name
  def get_single_field
    field = PowerbaseField.find_by(name: params[:name])
    if field
      render json: format_json(field)
    else
      render json: { message: "Field does not exist" }
    end
  end

  # PUT /fields/:id/alias
  def alias
    @field = PowerbaseField.find(safe_params[:id])

    if @field.update(alias: safe_params[:alias])
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/set_as_pii
  def set_as_pii
    @field = PowerbaseField.find(safe_params[:id])

    if @field.update(is_pii: true)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/unset_as_pii
  def unset_as_pii
    @field = PowerbaseField.find(safe_params[:id])

    if @field.update(is_pii: false)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  def construct_field(payload)
    field = {
      name: payload[:name],
      description: payload[:description],
      oid: payload[:oid],
      db_type: payload[:db_type],
      default_value: payload[:default_value],
      is_primary_key: payload[:is_primary_key],
      is_nullable: payload[:is_nullable],
      powerbase_table_id: payload[:powerbase_table_id],
      powerbase_field_type_id: payload[:powerbase_field_type_id],
      is_pii: payload[:is_pii],
      alias: payload[:alias]
    }

    view_field = {
      width: 300,
      is_frozen: false,
      is_hidden: false,
      order: payload[:order],
      table_view_id: payload[:view_id]
    }
    { field: field, view_field: view_field }
  end

  private
    def set_table
      @table = PowerbaseTable.find(safe_params[:table_id])

      if !@table
        raise StandardError.new("Could not find table with id of '#{safe_params[:table_id]}'")
      end
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
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: field.created_at,
        updated_at: field.updated_at,
      }
    end
end
