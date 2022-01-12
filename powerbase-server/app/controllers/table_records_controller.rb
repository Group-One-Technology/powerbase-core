class TableRecordsController < ApplicationController
  include SequelHelper
  include ElasticsearchHelper
  include PusherHelper
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

  schema(:upsert_magic_record) do
    optional(:id).value(:integer)
    optional(:data)
    required(:primary_keys)
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
    include_pii = !!safe_params[:include_pii] && current_user.can?(:manage_table, @table, false)

    model = Powerbase::Model.new(ElasticsearchClient, @table)
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

    model = Powerbase::Model.new(ElasticsearchClient, @table)
    records = model.where({
      page: safe_params[:page],
      limit: safe_params[:limit],
      filters: safe_params[:filters]
    })
    render json: records
  end

  # POST /tables/:id/upsert_magic_record
  def upsert_magic_record
    @table = PowerbaseTable.find(safe_params[:id])
    raise NotFound.new("Could not find table with id of #{safe_params[:id]}") if !@table
    current_user.can?(:add_records, @table)
    model = Powerbase::Model.new(ElasticsearchClient, @table)
    record = model.update_doc_record({
      primary_keys: safe_params[:primary_keys],
      fields: safe_params[:fields],
      data: safe_params[:data]
    })
    render json: record
  end

  # POST /tables/:id/remote_value
  def update_remote_value
    # TODO - Refactor into a helper/module to reduce code length
    @field = PowerbaseField.find(safe_params[:field_id])
    raise NotFound.new("Could not find field with id of #{safe_params[:field_id]}") if !@field
    current_user.can?(:edit_field_data, @field)
    @table = @field.powerbase_table
    @powerbase_database = @table.db
    table_name = @table.name
    primary_keys = sanitize_remote_field_data(safe_params[:primary_keys])
    data = sanitize_remote_field_data(safe_params[:data])
    query = Powerbase::QueryCompiler.new({
      table_id: @table.id,
      adapter: @powerbase_database.adapter,
      turbo: @powerbase_database.is_turbo
    })
    sequel_query = query.find_by(primary_keys).to_sequel
    updated_value = sequel_connect(@powerbase_database) {|db|
      db.from(table_name.to_sym)
      .yield_self(&sequel_query)
      .update(data)
    }
    if !updated_value
      render json: { error: "Could not update value for row in '#{table_name}'" }, status: :unprocessable_entity
      return
    end
    if @powerbase_database.is_turbo
      model = Powerbase::Model.new(ElasticsearchClient, @table)
      record = model.update_doc_record(primary_keys: primary_keys, data: data)

      if !record
        render json: { error: "Could not update value for given record in Elasticsearch'" }, status: :unprocessable_entity
        return
      end
      remote_update_client_notifier(@table.id, primary_keys)
      render json: updated_value
      return
    end
    remote_update_client_notifier(@table.id, primary_keys)
    render json: updated_value
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

    def remote_update_client_notifier(id, primary_keys)
      doc_id = format_doc_id("#{primary_keys.keys.first.to_s}_#{primary_keys.values.first}")
      pusher_trigger!("table.#{id}", "powerbase-data-listener", {doc_id: doc_id}.to_json)
    end
end

