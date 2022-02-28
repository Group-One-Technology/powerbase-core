class PowerbaseFieldsController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_field_access, except: [:index, :update_allowed_roles, :update_field_permission, :create]
  before_action :check_field_permission_access, only: [:update_allowed_roles, :update_field_permission]
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

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

  schema(:enable_validation, :disable_validation) do
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
  schema(:update_allowed_roles) do
    required(:id).value(:integer)
    required(:permission)
    required(:roles)
  end

  schema(:create) do
    required(:id).value(:integer)
    required(:new_field_entities)
  end

  # GET /tables/:table_id/fields
  def index
    @table = PowerbaseTable.find(safe_params[:table_id])
    raise NotFound.new("Could not find table with id of #{safe_params[:table_id]}") if !@table
    current_user.can?(:view_table, @table)

    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @table.powerbase_database_id)
    @fields = PowerbaseField.where(powerbase_table_id: @table.id).order(name: :asc)

    render json: @fields
      .select {|field| current_user.can?(:view_field, field, false, @guest)}
      .map {|item| format_json(item)}
  end

  # POST /tables/:id/field
  def create
    options = safe_params[:new_field_entities]
    field_params = options.except(:order, :view_id)
    view_field_params = {width: 300, is_frozen: false, is_hidden: false, order: options[:order], table_view_id: options[:view_id]}
    @field = PowerbaseField.create(field_params)
    if !@field
      render json: { error: "Could not create a new virtual field for table '#{@table.id}'" }, status: :unprocessable_entity
      return
    end
    view_field_params[:powerbase_field_id] = @field.id
    @view_field = ViewFieldOption.create(view_field_params)
    if !@view_field
      render json: { error: "Could not create a view field for table '#{@table.id}'" }, status: :unprocessable_entity
      return
    end
    render json: format_json(@field)
  end

  # GET /tables/:id/fields/:name
  def get_single_field
    name = safe_params[:name]
    id = safe_params[:id]
    @field = PowerbaseField.where('lower(name) = ? and powerbase_table_id = ?', name.downcase, id).first
    if !@field
      render json: { error: 'Field does not exist' }, status: :not_found
      return
    end
    render json: format_json(@field)
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
    if !@field.table.has_primary_key?
      render json: { error: "There must be at least one primary key in this table to set a non-primary key field as PII." }, status: :unprocessable_entity
      return
    end

    if @field.is_primary_key
      render json: { error: "Setting a primary key field as a PII is not allowed." }, status: :unprocessable_entity
      return
    end

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

  # PUT /fields/:id/enable_validation
  def enable_validation
    if @field.update(has_validation: true)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/disable_validation
  def disable_validation
    if @field.update(has_validation: false)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/allowed_roles
  def update_allowed_roles
    field_updater = Fields::Updater.new(@field)
    field_updater.update_allowed_roles!(safe_params[:permission], safe_params[:roles])

    render status: :no_content
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

    def set_table
      @table = PowerbaseTable.find(safe_params[:table_id])
    end

    def check_field_permission_access
      @field = PowerbaseField.find(safe_params[:id])
      raise NotFound.new("Could not find field with id of #{safe_params[:id]}") if !@field
      current_user.can?(:change_guest_access, @field.powerbase_table.powerbase_database)
    end

    def format_json(field)
      {
        id: field.id,
        name: field.name,
        alias: field.alias || field.name,
        description: field.description,
        default_value: field.default_value,
        is_primary_key: field.is_primary_key,
        is_nullable: field.is_nullable,
        is_auto_increment: field.is_auto_increment,
        is_pii: field.is_pii,
        has_validation: field.has_validation,
        options: field.options,
        permissions: field.permissions,
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: field.created_at,
        updated_at: field.updated_at,
        is_virtual: field.is_virtual,
        allow_dirty_value: field.allow_dirty_value
      }
    end
end
