class PowerbaseFieldsController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_field_access, except: [:index, :add]

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

  schema(:update_field_permission) do
    required(:id).value(:integer)
    required(:permission)
    required(:access)
  end

  schema(:get_single_field) do
    required(:id).value(:integer)
    required(:name)
  end

  # GET /tables/:id/fields
  def index
    @table = PowerbaseTable.find(safe_params[:table_id])
    raise NotFound.new("Could not find table with id of #{safe_params[:table_id]}") if !@table
    current_user.can?(:view_table, @table)

    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @table.powerbase_database_id)
    @fields = PowerbaseField.where(powerbase_table_id: @table.id).order(:id)

    render json: @fields
      .select {|field| current_user.can?(:view_field, field, @guest, false)}
      .map {|item| format_json(item)}
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
      render json: format_json(@field)
    end
  end

  # GET /tables/:id/fields/:name
  def get_single_field
    name = safe_params[:name]
    id = safe_params[:id]
    field = PowerbaseField.where('lower(name) = ? and powerbase_table_id = ?', name.downcase, id).first
    if field
      render json: format_json(field)
    else
      render json: { message: "Field does not exist" }
    end
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

  def construct_field(payload)
    field = {
      name: payload[:name],
      description: payload[:description],
      db_type: payload[:db_type],
      default_value: payload[:default_value],
      is_primary_key: payload[:is_primary_key],
      is_nullable: payload[:is_nullable],
      powerbase_table_id: payload[:powerbase_table_id],
      powerbase_field_type_id: payload[:powerbase_field_type_id],
      is_pii: payload[:is_pii],
      alias: payload[:alias],
      is_virtual: payload[:is_virtual],
      allow_dirty_value: payload[:allow_dirty_value],
      precision: payload[:precision],
      options: payload[:options]
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
    end
  # PUT /fields/:id/update_field_permission
  def update_field_permission
    field_updater = Fields::Updater.new(@field)
    field_updater.update_access!(safe_params[:permission], safe_params[:access])

    render status: :no_content
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
        permissions: field.permissions,
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: field.created_at,
        updated_at: field.updated_at,
        is_virtual: field.is_virtual,
        precision: field.precision,
        allow_dirty_value: field.allow_dirty_value
      }
    end
end
