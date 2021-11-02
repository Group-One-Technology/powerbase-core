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
    new_magic_record = nil
    record_id = params[:record_id]
    magic_record = MagicRecord.find_by(record_id: record_id, table_id: params[:table_id])
    if magic_record
      magic_record.update(text_value: params[:text_value])
    else
      new_magic_record = MagicRecord.create({table_id: params[:table_id], record_id: params[:record_id], text_value: params[:text_value], field_name: params[:field_name]})
    end
    render json: {} if new_magic_record
  end

  # GET /tables/:id/magic_records
  def magic_records
    magic_records = MagicRecord.where(table_id: params[:id])
    formatted_records = magic_records.map { |record| format_json(record) }
    puts magic_records
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

  def format_json(field)
    {
      id: field.id,
      field_name: field.field_name,
      text_value: field.text_value,
      record_id: field.record_id,
      table_id: field.table_id,
    }
  end

end

