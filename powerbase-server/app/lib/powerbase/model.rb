include ElasticsearchHelper
include SequelHelper

module Powerbase
  class Model
    DEFAULT_PAGE_SIZE = 40

    # * Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(esclient, table)
      @esclient = esclient
      @table = table.is_a?(ActiveRecord::Base) ? table : PowerbaseTable.find(table)
      @index = @table.index_name
      @table_name = @table.name
      @database = @table.db
      @is_turbo = @database.is_turbo
    end

    # Updates a property in a document/table record.
    # Accepts the following options:
    # :primary_keys :: a hash of primary keys values.
    # :data :: a hash of updated values.
    def update_doc_record(options)
      create_index!(@index) if !@is_turbo
      result = update_record(@index, options[:primary_keys], options[:data], !@is_turbo)
      { doc_id: result["_id"], result: result["result"], data: options[:data] }
    end

    # * Get a document/table record.
    # Accepts the following options:
    # :id :: the document ID or the SWR key.
    # :primary_keys :: an object of the table's primary keys.
    #    Ex: { pathId: 123, userId: 1245 }
    def get(options)
      include_pii = options[:include_pii]
      include_json = options[:include_json]

      query = Powerbase::QueryCompiler.new(@table, {
        include_pii: include_pii,
        include_json: include_json,
      })

      if @is_turbo
        search_params = query.find_by(options[:primary_keys]).to_elasticsearch

        result = @esclient.search(index: @index, body: search_params)
        raise StandardError.new("Record not found") if result["hits"]["hits"][0] == nil
        format_es_result(result)[0]
      else
        sequel_query = query.find_by(options[:primary_keys]).to_sequel

        remote_db() {|db|
          db.from(@table_name)
            .yield_self(&sequel_query)
            .first
        }
      end
    end

    # * Get document/table records based on the given columns.
    # :filters :: a JSON that contains the filter for the records.
    #    Ex: { pathId: 123, userId: 1245 }
    # :page :: the page number.
    # :limit :: the page count. No. of records to get per page.
    def where(options)
      page = options[:page] || 1
      limit = options[:limit] || 5
      query = Powerbase::QueryCompiler.new(@table)

      if @is_turbo
        search_params = query.find_by(options[:filters]).to_elasticsearch
        search_params[:from] = (page - 1) * limit
        search_params[:size] = limit
        result = @esclient.search(index: @index, body: search_params)
        format_es_result(result)
      else
        query_string = query.find_by(options[:filters]).to_sequel
        remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query_string)
            .paginate(page, limit)
            .all
        }
      end
    end

    # * Get the filtered and paginated table records.
    # Accepts the following options:
    # :query :: a string that contains the search query for the records.
    # :filter :: a JSON that contains the filter for the records.
    # :sort :: a JSON that contains the sort for the records.
    # :page :: the page number.
    # :limit :: the page count. No. of records to get per page.
    def search(options)
      page = options[:page] || 1
      limit = options[:limit] || @table.page_size
      query = Powerbase::QueryCompiler.new(@table, {
        query: options[:query],
        filter: options[:filters],
        sort: options[:sort],
      })

      if @is_turbo
        search_params = query.to_elasticsearch
        search_params[:from] = (page - 1) * limit
        search_params[:size] = limit
        result = @esclient.search(index: @index, body: search_params)
        format_es_result(result)
      else
        magic_search_params = query.to_elasticsearch
        magic_records = nil

        if magic_search_params != nil
          magic_search_params[:from] = (page - 1) * limit
          magic_search_params[:size] = limit
          magic_result = @esclient.search(index: @index, body: magic_search_params)
          magic_records = format_es_result(magic_result)
        end

        records = remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query.to_sequel)
            .paginate(page, limit)
            .all
        }

        merge_records(records, magic_records)
      end
    end

    # * Get total table records.
    # Accepts the following options:
    # :query :: a string that contains the search query for the records.
    # :filter :: a JSON that contains the filter for the records.
    def get_count(options)
      query = Powerbase::QueryCompiler.new(@table, {
        query: options[:query],
        sort: false,
        filter: options[:filters],
      })

      if @is_turbo
        search_params = query.to_elasticsearch.except(:_source, :script_fields)
        response = @esclient.perform_request("GET", "#{@index}/_count", {}, search_params).body
        response["count"]
      else
        remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query.to_sequel)
            .count
        }
      end
    end

    private
      def remote_db
        sequel_connect(@database) do |db|
          yield(db) if block_given?
        end
      end

      def sanitize(string)
        string.gsub(/['"]/,'')
      end

      def format_es_result(result)
        result["hits"]["hits"].map do |result|
          if result["fields"] && result["fields"].length > 0
            result["fields"].each do |key, value|
              result["_source"][key] = value[0]
            end
          end

          result["_source"].symbolize_keys.merge("doc_id": result["_id"])
        end
      end

      def merge_records(records, magic_records)
        return records if magic_records == nil
        primary_keys = @table.primary_keys
        fields = @table.fields

        records.map do |record|
          doc_id = get_doc_id(primary_keys, record, fields)
          magic_record = magic_records.select {|item| item[:doc_id] == doc_id}.first || {}

          { **record, **magic_record }
        end
      end
  end
end