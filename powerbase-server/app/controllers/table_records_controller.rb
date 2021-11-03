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

  # POST /magic_records/:record_id
  def add_or_update_magic_record
    type = params[:key_type]
    new_magic_record = nil
    record_id = params[:record_id]
    magic_record = MagicRecord.find_by(record_id: record_id, table_id: params[:table_id], field_id: params[:field_id])
    if magic_record
      magic_record.update(type => params[type])
    else
      puts "WHOOP"
      new_magic_record = MagicRecord.create({has_precision: params[:has_precision], field_id: params[:field_id], table_id: params[:table_id], record_id: params[:record_id], type => params[type], field_name: params[:field_name], field_type_id: params[:field_type_id]})
    end
    render json: {} if new_magic_record
  end

  # GET /tables/:id/magic_records
  def magic_records
    magic_records = MagicRecord.where(table_id: params[:id])
    formatted_records = magic_records.map { |record| format_json(record) }
    render json: formatted_records
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
      table_id: record.table_id,
      has_precision: record.has_precision,
      field_id: record.field_id,
      field_type_id: record.field_type_id
    }
  end

end

