class TableRecordsController < ApplicationController
  include SequelHelper
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
  end


  schema(:add_or_update_magic_value) do
    optional(:id).value(:integer)
    optional(:data)
    required(:primary_keys)
  end

  schema(:magic_values) do
    required(:id).value(:integer)
  end

  schema(:update_remote_value) do
    required(:id).value(:integer)
    required(:primary_keys)
    required(:data)
    required(:field_id).value(:integer)
  end

  # POST /tables/:table_id/records
  def index
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(ElasticsearchClient, @table)
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
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(ElasticsearchClient, @table)
    record = model.get({
      id: safe_params[:id],
      primary_keys: safe_params[:primary_keys],
    })

    render json: record
  end

  # POST /tables/:id/linked_records
  # TODO: Refactor - to combine with index method / model.search
  def linked_records
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(ElasticsearchClient, @table)
    records = model.where({
      page: safe_params[:page],
      limit: safe_params[:limit],
      filters: safe_params[:filters]
    })
    render json: records
  end

  # POST /tables/:id/magic_value
  def add_or_update_magic_value
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:add_records, @table)
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:id])
    record = model.update_record({
      primary_keys: safe_params[:primary_keys],
      fields: safe_params[:fields],
      data: safe_params[:data]
    })
    render json: record
  end

  # POST /tables/:id/remote_value
  def update_remote_value
    @field = PowerbaseField.find(safe_params[:field_id])
    raise NotFound.new("Could not find field with id of #{safe_params[:field_id]}") if !@field
    current_user.can?(:edit_field_data, @field)
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    primary_keys = sanitize_remote_field_data(safe_params[:primary_keys])
    data = sanitize_remote_field_data(safe_params[:data])
    table_name = @table.name
    @powerbase_database = PowerbaseDatabase.find(@table.powerbase_database_id)
    raise NotFound.new("Could not find containing database for table with id of #{safe_params[:id]}") if !@powerbase_database
    db = sequel_connect(@powerbase_database)
    updated_value = db[table_name.to_sym].where(primary_keys).update(data)
    if !updated_value
      render json: { error: "Could not update value for row in '#{table_name}'" }, status: :unprocessable_entity
      return
    end
    render json: updated_value
  end

  # GET /tables/:id/magic_values
  def magic_values
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(ElasticsearchClient, @table)
    @records = model.magic_search
    render json: @records
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

    model = Powerbase::Model.new(ElasticsearchClient, @table)
    total_records = model.get_count({
      query: safe_params[:query],
      filters: safe_params[:filters]
    })

    render json: { count: total_records }
  end

  private
    def sanitize_remote_field_data(field_data)
      sanitized_data = {}
      field_data.each do |key, value|
        curr_field = PowerbaseField.find(key)
        raise NotFound.new("Could not find field with id of #{key}") if !curr_field
        curr_field_name = curr_field.name
        sanitized_data[curr_field_name] = value
      end
      sanitized_data.symbolize_keys
    end
end

