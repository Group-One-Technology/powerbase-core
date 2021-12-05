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
  end


  schema(:add_or_update_magic_value) do
    required(:table_id).value(:integer)
    optional(:id).value(:string)
    optional(:data)
    required(:primary_keys)
    required(:value)
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

  # POST /magic_values
  def add_or_update_magic_value
    @table = PowerbaseTable.find(params[:table_id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:add_records, @table)
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:table_id])
    record = model.update_record({
      primary_keys: safe_params[:primary_keys],
      fields: safe_params[:fields],
      data: safe_params[:data]
    })
    render json: record
  end

  # GET /tables/:id/magic_values
  def magic_values
    @table = PowerbaseTable.find(params[:id])
    raise NotFound.new("Could not find table with id of #{params[:id]}") if !@table
    current_user.can?(:view_table, @table)

    model = Powerbase::Model.new(ElasticsearchClient, @table)
    @records = model.magic_search
    puts @records

    render json: @records
  end

  # POST /magic_records
  def create_magic_record
    new_magic_record = MagicRecord.create({powerbase_table_id: params[:powerbase_table_id], powerbase_database_id: params[:powerbase_database_id], powerbase_record_order: params[:powerbase_record_order]})
    render json: new_magic_record
  end

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

  def format_json(value)
    {
      id: value.id,
      value: value.value,
      magic_record_id: value.magic_record_id,
      table_id: value.powerbase_table_id,
      field_id: value.powerbase_field_id,
      field_type_id: value.powerbase_field_type_id
    }
  end

end

