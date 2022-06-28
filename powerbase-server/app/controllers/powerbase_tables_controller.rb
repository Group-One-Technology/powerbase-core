class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_table_access, only: [:alias, :clear_error_logs, :update, :update_default_view, :update_primary_keys]
  before_action :check_table_permission_access, only: [:update_allowed_roles, :update_table_permission]

  schema(:index) do
    required(:database_id).value(:integer)
    optional(:name).value(:string)
    optional(:alias).value(:string)
  end

  schema(:show, :alias, :hide, :unhide, :drop, :clear_error_logs, :logs, :update) do
    required(:id).value(:integer)
    optional(:alias).value(:string)
  end

  schema(:create) do
    required(:database_id).value(:integer)
    required(:name).value(:string)
    required(:alias).value(:string)
    required(:is_virtual).value(:bool)
    required(:fields).array(:hash) do
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
  end

  schema(:reorder) do
    required(:database_id)
    required(:tables)
  end

  schema(:update_default_view) do
    required(:id).value(:string)
    required(:view_id)
  end

  schema(:update_primary_keys) do
    required(:id).value(:string)
    required(:primary_keys)
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

  schema(:reindex_records) do
    required(:id).value(:integer)
  end

  # GET /databases/:database_id/tables
  def index
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    current_user.can?(:view_base, @database)

    if safe_params[:name] != nil || safe_params[:alias] != nil
      @table = PowerbaseTable.find_by(
        "(alias = ? OR name = ?) and powerbase_database_id = ?",
        safe_params[:alias],
        (safe_params[:name] || safe_params[:alias].snakecase),
        @database.id
      )
      render json: @table ? { id: @table.id } : nil
      return
    end

    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @database.id)

    render json: @database.tables
      .order(order: :asc)
      .select {|table| current_user.can?(:view_table, table, false, @guest)}
      .map {|item| format_json(item)}
  end

  # GET /tables/:id
  def show
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    render json: format_json(@table)
  end

  # PUT /tables/:id/alias
  def alias
    if @table.update(alias: safe_params[:alias])
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # POST /databases/:database_id/tables
  def create
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    current_user.can?(:add_tables, @database)

    if safe_params[:fields].length === 0
      raise StandardError.new("There must be at least one field to create a table.")
    end

    schema = Databases::Schema.new @database
    schema.create_table({
      name: safe_params[:name],
      alias: safe_params[:alias],
      is_virtual: safe_params[:is_virtual],
    }, safe_params[:fields])
  end

  # PUT /tables/:id/hide
  def hide
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:manage_base, @table.db)

    visible_tables = PowerbaseTable.where(is_hidden: false, powerbase_database_id: @table.powerbase_database_id)
      .select {|item| item.id != @table.id}

    raise StandardError.new("Cannot hide table. There must be at least one visible table left in a base") if visible_tables.length == 0

    if @table.update(is_hidden: true)
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end
  
  # PUT /tables/:id/unhide
  def unhide
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:manage_base, @table.db)

    if @table.update(is_hidden: false)
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # DELETE /tables/:id/drop
  def drop
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:delete_tables, @table.db)

    visible_tables = PowerbaseTable.where(is_hidden: false, powerbase_database_id: @table.powerbase_database_id)
      .select {|item| item.id != @table.id}

    raise StandardError.new("Cannot drop table. There must be at least one visible table left in a base") if visible_tables.length == 0

    @table.drop
    render status: :no_content
  end

  # GET /tables/:id/logs
  def logs
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:manage_base, @table.db)
    render json: logs_format_json(@table)
  end

  # PUT /tables/:id/clear_error_logs
  def clear_error_logs
    logs = @table.logs
    logs["migration"] = {} if logs["migration"] == nil
    logs["migration"]["errors"] = []
    if @table.update(logs: logs)
      render status: :no_content
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # PUT /tables/:id/update
  def update
    if @table.update(safe_params)
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # PUT /databases/:database_id/tables/reorder
  def reorder
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    current_user.can?(:manage_base, @database)

    safe_params[:tables].each do |table|
      @table = PowerbaseTable.find(table[:id])
      @table.update(order: table[:order])
    end

    render status: :no_content
  end

  # PUT tables/:id/update_default_view
  def update_default_view
    if @table.update(default_view_id: safe_params[:view_id])
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # PUT /tables/:id/update_primary_keys
  def update_primary_keys
    @table.update_primary_keys(safe_params[:primary_keys])
    render status: :no_content
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

  # POST /tables/:id/reindex_records
  def reindex_records
    @table = PowerbaseTable.find safe_params[:id]
    @table.reindex_later!
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
        is_virtual: table.is_virtual,
        has_primary_key: table.has_primary_key?,
        status: table.status,
        is_reindexing: table.status == "indexing_records" || Array(table.logs["migration"]["old_primary_keys"]).length > 0,
        logs: table.logs,
        permissions: table.permissions,
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
      }
    end

    def logs_format_json(table)
      {
        id: table.id,
        name: table.name,
        alias: table.alias || table.name,
        order: table.order,
        status: table.status,
        total_records: table.logs["migration"]["total_records"],
        indexed_records: table.logs["migration"]["indexed_records"],
        unmigrated_fields: table.logs["migration"]["unmigrated_columns"] || [],
        migrated_fields: table.fields.map {|item| field_format_json(item)},
        logs: table.logs,
        is_migrated: table.is_migrated,
        is_virtual: table.is_virtual,
        created_at: table.created_at,
        updated_at: table.updated_at,
      }
    end

    def field_format_json(field)
      {
        id: field.id,
        name: field.name,
        alias: field.alias,
      }
    end
end
