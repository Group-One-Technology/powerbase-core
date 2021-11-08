class PowerbaseTablesController < ApplicationController
  before_action :authorize_access_request!
  before_action :set_database, only: [:index]
  before_action :set_table, only: [:show, :update, :update_default_view]

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
    render json: {
      migrated: @database.is_migrated,
      tables: @database.powerbase_tables.order(order: :asc).map {|item| format_json(item)}
    }
  end

  # GET /tables/:id
  def show
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
    safe_params[:tables].each_with_index do |table, index|
      @table = PowerbaseTable.find(table[:id])
      @table.update(alias: table[:alias], order: index)
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
    puts standardized_table_params
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
          puts "HEYYYYYYY"
          standardized_field_params = standardize_field_params(field_param, table)
          cur_field = PowerbaseField.create(standardized_field_params)
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
    render json: format_json(table)

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
    def set_database
      @database = PowerbaseDatabase.find(safe_params[:database_id])

      if !@database
        raise StandardError.new("Must establish a database connection first to execute this action.")
      end
    end

    def set_table
      @table = PowerbaseTable.find(safe_params[:id])
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
        is_migrated: table.is_migrated,
        created_at: table.created_at,
        updated_at: table.updated_at,
        database_id: table.powerbase_database_id,
        is_virtual: table.is_virtual
      }
    end
end
