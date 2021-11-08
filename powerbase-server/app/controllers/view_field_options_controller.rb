class ViewFieldOptionsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index, :hide_all) do
    required(:view_id).value(:integer)
  end

  schema(:hide, :unhide) do
    required(:id).value(:integer)
  end

  schema(:resize) do
    required(:id).value(:integer)
    required(:width).value(:integer)
  end

  schema(:update_order) do
    required(:view_id)
    required(:view_fields)
  end

  # GET /views/:view_id/fields
  def index
    @view_fields = ViewFieldOption.where(table_view_id: safe_params[:view_id]).order(:order)
    render json: @view_fields.map {|item| format_json(item)}
  end

  # PUT /views/:view_id/fields/hide_all
  def hide_all
    @view = TableView.find(safe_params[:view_id]);
    check_database_access(@view.powerbase_table.powerbase_database_id, ["owner", "admin", "editor"]) or return

    @view.view_field_options.each do |field|
      field.update(is_hidden: true)
    end

    render status: :no_content
  end

  # PUT /views/:view_id/view_fields/order
  def update_order
    @view = TableView.find(safe_params[:view_id]);
    check_database_access(@view.powerbase_table.powerbase_database_id, ["owner", "admin", "editor"]) or return

    safe_params[:view_fields].each_with_index do |view_field_id, index|
      view_field = ViewFieldOption.find(view_field_id)
      view_field.update(order: index)
    end

    render status: :no_content
  end

  # PUT /view_fields/:id/hide
  def hide
    @view_field = ViewFieldOption.find(safe_params[:id])
    check_database_access(@view_field.table_view.powerbase_table.powerbase_database_id, ["owner", "admin", "editor"]) or return

    if @view_field.update(is_hidden: true)
      render json: format_json(@view_field)
    else
      render json: @view_field.errors, status: :unprocessable_entity
    end
  end

  # PUT /view_fields/:id/unhide
  def unhide
    @view_field = ViewFieldOption.find(safe_params[:id])
    check_database_access(@view_field.table_view.powerbase_table.powerbase_database_id, ["owner", "admin", "editor"]) or return

    if @view_field.update(is_hidden: false)
      render json: format_json(@view_field)
    else
      render json: @view_field.errors, status: :unprocessable_entity
    end
  end

  # PUT /view_fields/:id/resize
  def resize
    @view_field = ViewFieldOption.find(safe_params[:id])
    check_database_access(@view_field.table_view.powerbase_table.powerbase_database_id, ["owner", "admin", "editor"]) or return

    @view_field.update_attribute(:width, safe_params[:width])
    render json: format_json(@view_field) if @view_field.save!
  end

  private
    def format_json(view_field)
      field = view_field.powerbase_field

      {
        id: view_field.id,
        field_id: view_field.powerbase_field_id,
        name: field.name,
        alias: field.alias,
        db_type: field.db_type,
        description: field.description,
        default_value: field.default_value,
        is_primary_key: field.is_primary_key,
        is_nullable: field.is_nullable,
        order: view_field.order,
        width: view_field.width,
        is_frozen: view_field.is_frozen,
        is_hidden: view_field.is_hidden,
        is_pii: field.is_pii,
        options: field.options,
        view_id: view_field.table_view_id,
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: view_field.created_at,
        updated_at: view_field.updated_at,
      }
    end
end
