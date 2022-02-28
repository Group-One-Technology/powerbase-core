class ViewFieldOptionsController < ApplicationController
  before_action :authorize_access_request!
  before_action :check_view_access, only: [:hide_all, :update_order]
  before_action :check_view_field_access, only: [:hide, :unhide, :resize]

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
    @view = TableView.find(safe_params[:view_id])
    raise NotFound.new("Could not find view with id of #{safe_params[:view_id]}") if !@view
    @table = @view.powerbase_table
    current_user.can?(:view_table, @table)

    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @table.powerbase_database_id)
    @view_fields = ViewFieldOption.where(table_view_id: @view.id).order(:order)

    render json: @view_fields
      .select {|view_field| current_user.can?(:view_field, view_field.powerbase_field, false, @guest)}
      .map {|item| format_json(item)}
  end

  # PUT /views/:view_id/fields/hide_all
  def hide_all
    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @view.powerbase_table.powerbase_database_id)

    @view.view_field_options.each do |view_field|
      if current_user.can?(:view_field, view_field.powerbase_field, false, @guest)
        view_field.update(is_hidden: true)
      end
    end

    render status: :no_content
  end

  # PUT /views/:view_id/view_fields/order
  def update_order
    safe_params[:view_fields].each_with_index do |view_field_id, index|
      view_field = ViewFieldOption.find(view_field_id)
      view_field.update(order: index)
    end

    render status: :no_content
  end

  # PUT /view_fields/:id/hide
  def hide
    if @view_field.update(is_hidden: true)
      render json: format_json(@view_field)
    else
      render json: @view_field.errors, status: :unprocessable_entity
    end
  end

  # PUT /view_fields/:id/unhide
  def unhide
    if @view_field.update(is_hidden: false)
      render json: format_json(@view_field)
    else
      render json: @view_field.errors, status: :unprocessable_entity
    end
  end

  # PUT /view_fields/:id/resize
  def resize
    @view_field.update_attribute(:width, safe_params[:width])
    render json: format_json(@view_field) if @view_field.save!
  end

  private
    def check_view_access
      @view = TableView.find(safe_params[:view_id]);
      raise NotFound.new("Could not find view with id of #{safe_params[:view_id]}") if !@view
      current_user.can?(:manage_view, @view)
    end

    def check_view_field_access
      @view_field = ViewFieldOption.find(safe_params[:id])
      raise NotFound.new("Could not find view field with id of #{safe_params[:id]}") if !@view_field
      current_user.can?(:manage_view, @view_field.table_view)
    end

    def format_json(view_field)
      field = view_field.powerbase_field

      {
        id: view_field.id,
        field_id: view_field.powerbase_field_id,
        name: field.name,
        alias: field.alias || field.name,
        db_type: field.db_type,
        description: field.description,
        default_value: field.default_value,
        is_primary_key: field.is_primary_key,
        is_nullable: field.is_nullable,
        order: view_field.order,
        width: view_field.width,
        is_frozen: view_field.is_frozen,
        is_hidden: view_field.is_hidden,
        is_auto_increment: field.is_auto_increment,
        is_pii: field.is_pii,
        has_validation: field.has_validation,
        options: field.options,
        permissions: field.permissions,
        view_id: view_field.table_view_id,
        table_id: field.powerbase_table_id,
        field_type_id: field.powerbase_field_type_id,
        created_at: view_field.created_at,
        updated_at: view_field.updated_at,
        is_virtual: field.is_virtual,
      }
    end
end
