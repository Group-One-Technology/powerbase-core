class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_table_access, only: [:update, :update_default_view, :update_primary_keys]
  before_action :check_table_permission_access, only: [:update_allowed_roles, :update_table_permission]

  schema(:index) do
    required(:database_id).value(:integer)
  end

  schema(:show, :hide, :logs, :update) do
    required(:id).value(:integer)
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

  schema(:create) do
    required(:id).value(:integer)
    required(:table)
    required(:fields)
  end

  schema(:reindex_records) do
    required(:id).value(:integer)
  end

  # GET /databases/:database_id/tables
  def index
    @database = PowerbaseDatabase.find(safe_params[:database_id])
    raise NotFound.new("Could not find database with id of #{safe_params[:database_id]}") if !@database
    current_user.can?(:view_base, @database)

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

  # PUT /tables/:id/hide
  def hide
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:manage_base, @table.db)
    if @table.update(is_hidden: true)
      render json: format_json(@table)
    else
      render json: @table.errors, status: :unprocessable_entity
    end
  end

  # GET /tables/:id/logs
  def logs
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:manage_base, @table.db)

    render json: logs_format_json(@table)
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

  # This is a functional test endpoint for now alongside its corresponding helpers
  # TODO - add to validation schema on revisiting the feature
  def create
    table_params = safe_params[:table]
    fields_params = safe_params[:fields]
    standardized_table_params = standardize_table_params(table_params)
    res_fields = {}
    @table = PowerbaseTable.create(standardized_table_params)
    if !@table
      render json: { error: "Could not create the new virtual table'" }, status: :unprocessable_entity
      return
    end
    @view = TableView.create(
      name: "Default",
      view_type: "grid",
      order: @table.table_views.count,
      powerbase_table_id: @table.id,
    )
    if !@view
      render json: { error: "Could not create a view for the new virtual table'" }, status: :unprocessable_entity
      return
    end
    @table.default_view_id = @view.id
    @table.save!
    fields_params.each_with_index do |field_param, index|
      standardized_field_params = standardize_field_params(field_param, @table)
      cur_field = PowerbaseField.create(standardized_field_params)
      res_fields[cur_field.name] = cur_field.id
      view_field = ViewFieldOption.new
      view_field.width = case cur_field.powerbase_field_type_id
        when 3
          cur_field.name.length > 4 ? cur_field.name.length * 20 : 100
        else
          300
      end
      view_field.order = index + 1
      view_field.table_view_id = @view.id
      view_field.powerbase_field_id = cur_field.id
      view_field.save!
    end
    render json: {table: format_json(table), fields: res_fields}
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
        has_primary_key: table.has_primary_key?,
        status: table.status,
        is_reindexing: table.status == "indexing_records" || Array(table.logs["migration"]["old_primary_keys"]).length > 0,
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

    def standardize_table_params(params)
      {
        powerbase_database_id: params[:powerbase_database_id],
        is_migrated: params[:is_migrated],
        is_virtual: params[:is_virtual],
        alias: params[:alias],
        name: params[:name],
        page_size: params[:page_size]
      }
    end

    def standardize_field_params(params, table)
     {
        name: params[:name],
        description: params[:description],
        oid: params[:oid],
        db_type: params[:db_type],
        default_value: params[:default_value],
        is_primary_key: params[:is_primary_key],
        is_nullable: params[:is_nullable],
        powerbase_table_id: table.id,
        powerbase_field_type_id: params[:powerbase_field_type_id],
        is_pii: params[:is_pii],
        alias: params[:alias],
        is_virtual: params[:is_virtual],
        allow_dirty_value: params[:allow_dirty_value]
      }
    end
end
