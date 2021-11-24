class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_table_access, only: [:update, :update_default_view]

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

    safe_params[:tables].each_with_index do |table, index|
      @table = PowerbaseTable.find(table[:id])
      @table.update(alias: table[:alias], is_hidden: table[:is_hidden], order: index)
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

  def create_virtual_table
    table_params = params[:table]
    fields_params = params[:fields]
    standardized_table_params = standardize_table_params(table_params)
    res_fields = {}
    table = PowerbaseTable.create(standardized_table_params)
    if table
      @view = TableView.create(
        name: "Default",
        view_type: "grid",
        order: table.table_views.count,
        powerbase_table_id: table.id,
      )
      if @view
        table.default_view_id = @view.id
        table.save!
        fields_params.each_with_index do |field_param, index|
          standardized_field_params = standardize_field_params(field_param, table)
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
      end
    end
    render json: {table: format_json(table), fields: res_fields}

  end




  def standardize_table_params(params)
    {
      powerbase_database_id: params[:powerbase_database_id],
      is_migrated: params[:is_migrated],
      is_virtual: params[:is_virtual],
      alias: params[:alias],
      name: params[:name],
      order: params[:order],
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
      precision: params[:precision],
      allow_dirty_value: params[:allow_dirty_value]
    }
  end


  private
    def check_table_access
      @table = PowerbaseTable.find(safe_params[:id])
      raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
      current_user.can?(:manage_table, @table)
    end

    def format_json(table)
      {
        id: table.id,
        name: table.name,
        alias: table.alias,
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
        is_virtual: table.is_virtual
      }
    end
end
