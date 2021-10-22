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
    puts params
    # field = PowerbaseField.create({
    #   name: "OOPS",
    #   description: "",
    #   oid: 1043,
    #   db_type: "character varying",
    #   default_value: " ",
    #   is_primary_key: false,
    #   is_nullable: false,
    #   powerbase_table_id: 59,
    #   powerbase_field_type_id: 1,
    #   is_pii: false,
    #   alias: "OOPS",
    # })

    type = ViewFieldOption.create({
      width: 300,
      is_frozen: false,
      is_hidden: false,
      order: 2,
      table_view_id: 59,
      powerbase_field_id: 919
    })
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
