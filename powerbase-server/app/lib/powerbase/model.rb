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

    # Updates a property in a remote database table record.
    # Accepts the following options:
    # :primary_keys :: a hash of primary keys values.
    # :data :: a hash of updated values.
    def update_remote_record(options)
      query = Powerbase::QueryCompiler.new(@table)
      sequel_query = query.find_by(options[:primary_keys]).to_sequel

      record = sequel_connect(@database) {|db|
        db.from(@table.name.to_sym)
          .yield_self(&sequel_query)
          .update(options[:data])
      }

      record = update_doc_record(primary_keys: primary_keys, data: data) if @table.db.is_turbo
      record
    end

    # Updates a property in a document/table record.
    # Accepts the following options:
    # :primary_keys :: a hash of primary keys values.
    # :data :: a hash of updated values.
    def update_doc_record(options)
      create_index!(@index) if !@is_turbo
      data = @is_turbo ? options[:data] : { **(options[:data] || {}), **(options[:primary_keys] || {}) }
      result = update_record(@index, options[:primary_keys], data, !@is_turbo)
      { doc_id: result["_id"], result: result["result"], data: data }
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

        record = remote_db() {|db|
          db.from(@table_name)
            .yield_self(&sequel_query)
            .first
        }

        magic_fields = @table.magic_fields

        if magic_fields.length > 0
          doc_id = format_doc_id(options[:primary_keys])
          magic_result = get_record(@index, doc_id)

          if magic_result["found"]
            magic_record = magic_result["_source"]

            # TODO: Remove when primary keys are now indexed for magic values and find_by is now working for to_elasticsearch.
            if !include_pii
              magic_record = magic_record.select do |key, value|
                field = magic_fields.find {|field| field.name == key.to_s}
                field ? !field.is_pii : false
              end
            end

            if !include_json
              json_text = PowerbaseFieldType.find_by(name: "JSON Text")
              magic_record = magic_record.map do |key, value|
                field = magic_fields.find {|field| field.name == key.to_s}
                next value[0..40] if field.powerbase_field_type_id == json_text.id
                next value
              end

            end

            { **record, **magic_record }
          end
        else
          record
        end
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
          magic_search_params[:size] = limit + 100
          magic_result = @esclient.search(index: @index, body: magic_search_params)
          magic_records = format_es_result(magic_result)
        end

        records = remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query.to_sequel)
            .paginate(page, limit)
            .all
        }

        query.merge_records(records, magic_records)
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
  end
end