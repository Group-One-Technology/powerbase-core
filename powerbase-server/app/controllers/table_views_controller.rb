class TableViewsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:table_id).value(:integer)
  end

  schema(:show, :destroy) do
    required(:id).value(:integer)
  end

  schema(:update) do
    required(:id).value(:integer)
    optional(:filters)
    optional(:sort)
    optional(:view_type)
    optional(:name)
  end

  schema(:create) do
    required(:table_id)
    required(:name)
    required(:view_type)
  end

  # GET /tables/:table_id/views
  def index
    @views = TableView.where(powerbase_table_id: safe_params[:table_id])
    render json: @views.map {|item| format_json(item)}
  end

  # GET /views/:id
  def show
    @view = TableView.find(safe_params[:id])
    render json: format_json(@view)
  end

  # POST /tables/:table_id/views
  def create
    @table = PowerbaseTable.find(safe_params[:table_id])
    @view = TableView.find_by(name: safe_params[:name], powerbase_table_id: safe_params[:table_id])

    if @view
      render json: { errors: ["View with name of \"#{safe_params[:name]}\" already exists for table \"#{@table.alias || @table.name}\""] }, status: :unprocessable_entity
      return
    end

    @view = @table.table_views.create({
      name: safe_params[:name],
      view_type: safe_params[:view_type],
    })

    if @view.save
      fields = PowerbaseField.where(powerbase_table_id: @table.id)
      fields.each_with_index do |cur_field, index|
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
        view_field.save
      end

      render json: format_json(@view), status: :created
    else
      render json: @view.errors, status: :unprocessable_entity
    end
  end

  # PUT /views/:id
  def update
    view_params = safe_params.output
    @view = TableView.find(view_params[:id])

    if view_params[:name]
      @existing_view = TableView.find_by(name: view_params[:name], powerbase_table_id: @view.powerbase_table_id)

      if @existing_view && @existing_view.id != @view.id
        render json: { errors: "View with name of \"#{view_params[:name]}\" already exists in this table." }, status: :unprocessable_entity
        return
      end
    end

    if @view.update(view_params)
      render json: format_json(@view)
    else
      render json: @view.errors, status: :unprocessable_entity
    end
  end

  # DELETE /views/:id
  def destroy
    @view = TableView.find(safe_params[:id])
    @table = @view.powerbase_table

    if @table.default_view_id === @view.id
      render json: { errors: "Cannot delete the view \"#{@view.name}\" for table \"#{@table.name}\". To delete this view, please change the current view first." }, status: :unprocessable_entity
      return
    end

    @view.destroy
  end

  private
    def format_json(view)
      {
        id: view.id,
        name: view.name,
        table_id: view.powerbase_table_id,
        view_type: view.view_type,
        filters: view.filters,
        sort: view.sort,
        created_at: view.created_at,
        updated_at: view.updated_at,
      }
    end
end
