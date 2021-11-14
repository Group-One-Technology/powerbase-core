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
    required(:primary_keys)
    optional(:data)
  end

  # POST /tables/:id/records
  def index
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:id])
    records = model.search({
      query: safe_params[:query],
      filters: safe_params[:filters],
      sort: safe_params[:sort],
      page: safe_params[:page],
      limit: safe_params[:limit],
    })
    render json: records
  end

  # POST /tables/:table_id/records/:id
  def show
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:table_id])
    record = model.get({
      id: safe_params[:id],
      primary_keys: safe_params[:primary_keys],
    })

    render json: record
  end

  # POST /tables/:id/linked_records
  # TODO: Refactor - to combine with index method / model.search
  def linked_records
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:id])
    records = model.where({
      page: safe_params[:page],
      limit: safe_params[:limit],
      filters: safe_params[:filters]
    })
    render json: records
  end

  # POST /magic_values
  def add_or_update_magic_value
    # type = params[:key_type]
    # magic_value = nil
    # new_magic_value = nil
    # record_id = params[:record_id]
    # magic_record_id = params[:magic_record_id]
    # # table_type_id = params[:table_type_id])
    # if magic_record_id
    #   magic_value = MagicValue.find_by(magic_record_id: magic_record_id, table_id: params[:table_id], field_id: params[:field_id])
    # else
    #   magic_value = MagicValue.find_by(record_id: record_id, table_id: params[:table_id], field_id: params[:field_id])
    # end

    # if magic_value
    #   magic_value.update(type => params[type])
    # else
    #   new_magic_value = MagicValue.create({has_precision: params[:has_precision], field_id: params[:field_id], table_id: params[:table_id], record_id: params[:record_id], type => params[type], field_name: params[:field_name], field_type_id: params[:field_type_id], magic_record_id: params[:magic_record_id]})
    # end
    # render json: {}
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:table_id])
    record = model.update_record({
      id: safe_params[:id],
      primary_keys: safe_params[:primary_keys],
      data: safe_params[:data]
    })

    render json: record
  end

  # GET /tables/:id/magic_values
  def magic_values
    magic_values = MagicValue.where(table_id: params[:id])
    formatted_values = magic_values.map { |value| format_json(value) }
    puts formatted_values
    render json: formatted_values
  end

  # POST /magic_records
  def create_magic_record
    new_magic_record = MagicRecord.create({powerbase_table_id: params[:powerbase_table_id], powerbase_database_id: params[:powerbase_database_id], powerbase_record_order: params[:powerbase_record_order]})
    render json: new_magic_record
  end

  # GET /tables/:id/records_count
  def count
    model = Powerbase::Model.new(ElasticsearchClient, safe_params[:id])
    total_records = model.get_count({
      query: safe_params[:query],
      filters: safe_params[:filters]
    })

    render json: { count: total_records }
  end

  def format_json(record)
    {
      id: record.id,
      field_name: record.field_name,
      text_value: record.text_value,
      string_value: record.string_value,
      decimal_value: record.decimal_value,
      integer_value: record.integer_value,
      record_id: record.record_id,
      magic_record_id: record.magic_record_id,
      table_id: record.table_id,
      has_precision: record.has_precision,
      field_id: record.field_id,
      field_type_id: record.field_type_id
    }
  end

end

