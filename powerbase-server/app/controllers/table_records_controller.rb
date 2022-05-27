class TableRecordsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index, :linked_records, :count) do
    required(:id).value(:integer)
    optional(:query)
    optional(:filters)
    optional(:sort)
    optional(:page).value(:integer)
    optional(:limit).value(:integer)
  end

  schema(:show) do
    required(:table_id).value(:integer)
    required(:id).value(:string)
    required(:primary_keys)
    optional(:include_pii).value(:bool)
    optional(:include_json).value(:bool)
  end

  schema(:sync_record) do
    required(:id).value(:integer)
    required(:primary_keys)
    optional(:include_pii).value(:bool)
    optional(:include_json).value(:bool)
  end

  schema(:add_record) do
    required(:id).value(:integer)
    required(:primary_keys)
    required(:data)
  end

  schema(:update_record) do
    required(:id).value(:integer)
    required(:primary_keys)
    required(:data)
  end

  schema(:update_field_data) do
    required(:id).value(:integer)
    required(:field_id).value(:integer)
    required(:primary_keys)
    required(:data)
  end

  schema(:delete_record) do
    required(:id).value(:integer)
    required(:primary_keys)
  end

  # POST /tables/:table_id/records
  def index
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(@table)
    @records = model.search({
      query: safe_params[:query],
      filters: safe_params[:filters],
      sort: safe_params[:sort],
      page: safe_params[:page],
      limit: safe_params[:limit],
    })

    render json: @records
  end

  # POST /tables/:table_id/records/:id
  def show
    @table = PowerbaseTable.find(safe_params[:table_id])
    raise NotFound.new("Could not find table with id of #{safe_params[:table_id]}") if !@table
    include_pii = !!safe_params[:include_pii] && current_user.can?(:manage_table, @table, false)

    model = Powerbase::Model.new(@table)
    record = model.get({
      id: safe_params[:id],
      primary_keys: safe_params[:primary_keys],
      include_pii: include_pii,
      include_json: !!safe_params[:include_json],
    })

    render json: record
  end

  # POST /tables/:id/linked_records
  # TODO: Refactor - to combine with index method / model.search
  def linked_records
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(@table)
    records = model.where({
      page: safe_params[:page],
      limit: safe_params[:limit],
      filters: safe_params[:filters]
    })
    render json: records
  end

  # POST /tables/:id/sync_record
  def sync_record
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:table_id]}") if !@table
    include_pii = !!safe_params[:include_pii] && current_user.can?(:manage_table, @table, false)

    model = Powerbase::Model.new(@table)
    record = model.sync_record({
      primary_keys: safe_params[:primary_keys],
      include_pii: include_pii,
      include_json: !!safe_params[:include_json],
    })

    render json: record
  end

  # PUT /tables/:id/add_record
  def add_record
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:add_records, @table)

    primary_keys = sanitize_field_data(safe_params[:primary_keys])
    data = sanitize_field_data(safe_params[:data])

    model = Powerbase::Model.new(@table)
    record = model.add_record(primary_keys: primary_keys, data: data)

    if record
      render json: record
    else
      render json: { error: "Could not add record in '#{@table.name}'" }, status: :unprocessable_entity
    end
  end

  # PUT /tables/:id/update_record
  def update_record
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    @guest = Guest.find_by(user_id: current_user.id, powerbase_database_id: @table.powerbase_database_id)
    primary_keys = sanitize_field_data(safe_params[:primary_keys])
    data = sanitize_field_data(safe_params[:data], @guest)

    if data&.length == 0
      render json: { error: "Could not update record in '#{@table.name}'. No data has been provided." }, status: :unprocessable_entity
      return
    end

    model = Powerbase::Model.new(@table)
    if model.update_merged_record(primary_keys: primary_keys, data: data)
      render json: { updated: true }
    else
      render json: { error: "Could not update record in '#{@table.name}'" }, status: :unprocessable_entity
    end
  end

  # PUT /tables/:id/update_field_data
  def update_field_data
    @field = PowerbaseField.find(safe_params[:field_id])
    raise NotFound.new("Could not find field with id of #{safe_params[:field_id]}") if !@field
    current_user.can?(:edit_field_data, @field)
    @table = @field.table
    primary_keys = sanitize_field_data(safe_params[:primary_keys])
    data = sanitize_field_data(Hash[@field.name.to_sym, safe_params[:data]])

    model = Powerbase::Model.new(@table)
    record = if @field.is_virtual
      model.update_doc_record(primary_keys: primary_keys, data: data)
    else
      model.update_remote_record(primary_keys: primary_keys, data: data)
    end

    if record
      render json: { updated: true }
    else
      render json: { error: "Could not update value for row in '#{@table.name}'" }, status: :unprocessable_entity
    end
  end

  # DELETE /tables/:id/delete_record
  def delete_record
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    primary_keys = sanitize_field_data(safe_params[:primary_keys])

    model = Powerbase::Model.new(@table)
    result = model.delete_merged_record(primary_keys: primary_keys)
    if result
      render json: { deleted: true, result: result }
    else
      render json: { error: "Could not delete record in '#{@table.name}'" }, status: :unprocessable_entity
    end
  end

  # POST /magic_records
  # A test endpoint that's functional for creating magic records (virtual rows) - TO CONTINUE ON NEXT FEATURE
  # def create_magic_record
  #   new_magic_record = MagicRecord.create({powerbase_table_id: params[:powerbase_table_id], powerbase_database_id: params[:powerbase_database_id], powerbase_record_order: params[:powerbase_record_order]})
  #   render json: new_magic_record
  # end

  # GET /tables/:id/records_count
  def count
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(@table)
    total_records = model.get_count({
      query: safe_params[:query],
      filters: safe_params[:filters]
    })

    render json: { count: total_records }
  end

  private
    def sanitize_field_data(fields, guest = nil)
      data = {}
      fields.each do |key, value|
        field = PowerbaseField.find_by(name: key, powerbase_table_id: @table.id)
        raise NotFound.new("Could not find field with id of #{key}") if !field
        current_user.can?(:edit_field_data, field, true, guest) if guest
        data[field.name.to_sym] = value
      end
      data
    end
end

