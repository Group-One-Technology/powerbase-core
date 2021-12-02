class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_table_access, only: [:update, :update_default_view]
  before_action :check_table_permission_access, only: [:update_allowed_roles, :update_table_permission]

  schema(:index) do
    required(:database_id).value(:string)
  end

  schema(:show, :update) do
    required(:id).value(:string)
    optional(:alias).value(:string)
  end

  schema(:update_tables) do
    required(:database_id)
    required(:tables)
  end

  schema(:update_default_view) do
    required(:id).value(:string)
    required(:view_id)
  end

  schema(:update_table_permission) do
    required(:id).value(:integer)
    required(:permission)
    required(:access)
  end

  schema(:update_allowed_roles) do
    required(:id).value(:integer)
    required(:permission)
    required(:roles)
  end

  # GET /databases/:database_id/tables
  def index
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    current_user.can?(:view_base, @database)

    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @database.id)

    render json: {
      migrated: @database.is_migrated,
      tables: @database.powerbase_tables
        .order(order: :asc)
        .select {|table| current_user.can?(:view_table, table, @guest, false)}
        .map {|item| format_json(item)}
    }
  end

  # GET /tables/:id
  def show
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    render json: format_json(@table)
  end

  # PUT /tables/:id/update
  def update
    if @table.update(safe_params)
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # PUT /databases/:database_id/tables/update
  def update_tables
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    current_user.can?(:manage_base, @database)

    is_updated = false

    ActiveRecord::Base.transaction do
      safe_params[:tables].each do |table|
        @table = PowerbaseTable.find(table[:id])
        @table.update(alias: table[:alias], is_hidden: table[:is_hidden], order: table[:order])
      end

      visible_tables = @database.powerbase_tables.select {|item| !item.is_hidden}

      if visible_tables.length <= 1
        raise ActiveRecord::Rollback
      else
        is_updated = true
      end
    end

    if is_updated
      render status: :no_content
    else
      render json: { error: "There must be at least one visible table in this base." }, status: :unprocessable_entity
    end
  end

  # PUT tables/:id/update_default_view
  def update_default_view
    if @table.update(default_view_id: safe_params[:view_id])
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # PUT /tables/:id/allowed_roles
  def update_allowed_roles
    table_updater = Tables::Updater.new(@table)
    table_updater.update_allowed_roles!(safe_params[:permission], safe_params[:roles])

    render status: :no_content
  end

  # PUT /tables/:id/update_table_permission
  def update_table_permission
    table_updater = Tables::Updater.new(@table)
    table_updater.update_access!(safe_params[:permission], safe_params[:access])

    render status: :no_content
  end

  private
    def check_table_access
      @table = PowerbaseTable.find(safe_params[:id])
      raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
      current_user.can?(:manage_table, @table)
    end

    def check_table_permission_access
      @table = PowerbaseTable.find(safe_params[:id])
      raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
      current_user.can?(:change_guest_access, @table.powerbase_database)
    end

    def format_json(table)
      {
        id: table.id,
        name: table.name,
        alias: table.alias || table.name,
        description: table.description,
        default_view_id: table.default_view_id,
        page_size: table.page_size,
        order: table.order,
        is_hidden: table.is_hidden,
        is_migrated: table.is_migrated,
        permissions: table.permissions,
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
      }
    end
end
