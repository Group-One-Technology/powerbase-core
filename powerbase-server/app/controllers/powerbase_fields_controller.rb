class PowerbaseFieldsController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_field_access, except: [:index, :create, :update_allowed_roles, :update_field_permission]
  before_action :check_field_permission_access, only: [:update_allowed_roles, :update_field_permission]
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  schema(:index) do
    required(:table_id).value(:integer)
    optional(:name).value(:string)
    optional(:alias).value(:string)
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

  schema(:set_as_pii, :unset_as_pii, :enable_validation, :disable_validation, :set_as_nullable, :unset_as_nullable) do
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
    required(:table_id).value(:integer)
    required(:name).value(:string)
    required(:alias).value(:string)
    optional(:db_type).value(:string)
    optional(:is_nullable).value(:bool)
    optional(:is_pii).value(:bool)
    optional(:has_validation).value(:bool)
    required(:field_type_id).value(:integer)
    required(:is_virtual).value(:bool)
    required(:is_primary_key).value(:bool)
    required(:select_options).value(:array)
    optional(:options)
  end

  schema(:destroy) do
    required(:id).value(:integer)
  end

  # GET /tables/:table_id/fields
  def index
    @table = PowerbaseTable.find(safe_params[:table_id])
    raise NotFound.new("Could not find table with id of #{safe_params[:table_id]}") if !@table
    current_user.can?(:view_table, @table)

    if safe_params[:name] != nil || safe_params[:alias] != nil
      @field = PowerbaseField.find_by(
        "(alias = ? OR name = ?) and powerbase_table_id = ?",
        safe_params[:alias],
        (safe_params[:name] || safe_params[:alias].snakecase),
        @table.id
      )
      render json: @field ? { id: @field.id } : nil
      return
    end

    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @table.powerbase_database_id)
    @fields = PowerbaseField.where(powerbase_table_id: @table.id).order(name: :asc)

    render json: @fields
      .select {|field| current_user.can?(:view_field, field, false, @guest)}
      .map {|item| format_json(item)}
  end

  # POST /tables/:id/fields
  def create
    @table = PowerbaseTable.find(safe_params[:table_id])
    raise NotFound.new("Could not find table with id of #{safe_params[:table_id]}") if !@table
    current_user.can?(:add_fields, @table)

    field_name = safe_params[:is_virtual] ? safe_params[:name].snakecase : safe_params[:name]
    field_creator = Fields::Creator.new([field_name, {
      alias: safe_params[:alias],
      allow_null: safe_params[:is_nullable],
      is_pii: safe_params[:is_pii],
      has_validation: safe_params[:has_validation],
      field_type_id: safe_params[:field_type_id],
      is_virtual: safe_params[:is_virtual],
      db_type: safe_params[:db_type],
      primary_key: safe_params[:is_primary_key],
      # * Select field types currently only supports postgresql hence the enum_values, mysql uses db_type for its option values.
      enum_values: safe_params[:select_options],
      options: safe_params[:options],
    }], @table, sync_db: true)

    if !field_creator.save
      render json: field_creator.field.errors, status: :unprocessable_entity
      return
    end

    render json: format_json(field_creator.field)
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

    if @field.db_type != nil && ["uuid", "int", "integer"].include?(@field.db_type)
      render json: { error: "Could not convert field with db_type of '#{@field.db_type}' to '#{@field_type.name}'. Value must be an decimal/numeric." }, status: :unprocessable_entity
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

  # PUT /fields/:id/set_as_nullable
  def set_as_nullable
    field_sequel = Fields::Schema.new @field
    if field_sequel.set_nullable(true)
      render json: format_json(@field)
    else
      render json: @field.errors, status: :unprocessable_entity
    end
  end

  # PUT /fields/:id/unset_as_nullable
  def unset_as_nullable
    field_sequel = Fields::Schema.new @field
    if field_sequel.set_nullable(false)
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

  # DELETE /fields/:id
  def destroy
    @field = PowerbaseField.find(safe_params[:id])
    raise NotFound.new("Could not find field with id of #{safe_params[:id]}") if !@field
    current_user.can?(:delete_fields, @field.table)
    @field.drop
    render status: :no_content
  end

  private
    def check_field_access
      @field = PowerbaseField.find(safe_params[:id])
      raise NotFound.new("Could not find field with id of #{safe_params[:id]}") if !@field
      current_user.can?(:manage_field, @field)
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
      }
    end
end
