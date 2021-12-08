include ElasticsearchHelper
include SequelHelper

module Powerbase
  class Model
    DEFAULT_PAGE_SIZE = 40

    # * Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(esclient, table)
      @esclient = esclient
      @powerbase_table = table.is_a?(ActiveRecord::Base) ? table : PowerbaseTable.find(table)
      @table_id = @powerbase_table.id
      @powerbase_database = PowerbaseDatabase.find(@powerbase_table.powerbase_database_id)
      @table_name = @powerbase_table.name
      @is_turbo = @powerbase_database.is_turbo
    end

    # Updates a property in a document/table record.
    # Accepts the following options:
    # :primary_keys :: a specific-format string concat of the primary keys and their values.
    def update_record(options)
      index = "table_records_#{@table_id}"
      id = options[:primary_keys]
      if !@is_turbo
        unless @esclient.indices.exists(index: index)
          @esclient.indices.create(
            index: index,
            body: {
              settings: { "index.mapping.ignore_malformed": true }
            }
          )
        end
        record = @esclient.update(index: index, id: id, body: { doc: options[:data], doc_as_upsert: true }, refresh: true,_source: true)
        record
      else
        response = @esclient.update(index: index, id: id, body: { doc: options[:data] }, _source: true)
        response
      end
    end

    # Gets all magic values for a non turbo table
    # REFACTOR to make fetch size flexible/dynamic - it's currently fixed because of the eventual aggregation
    # REFACTOR doc_id parameter to something else to avoid collisions
    def magic_search
      index = "table_records_#{@table_id}"
      result = @esclient.search(index: index, size: 10000)
      result["hits"]["hits"].map {|result| result["_source"].merge("doc_id": result["_id"])}
    end


    # * Get a document/table record.
    # Accepts the following options:
    # :id :: the document ID or the SWR key.
    # :primary_keys :: an object of the table's primary keys.
    #    Ex: { pathId: 123, userId: 1245 }
    def get(options)
      index = "table_records_#{@table_id}"

      query = Powerbase::QueryCompiler.new({
        table_id: @table_id,
        adapter: @powerbase_database.adapter,
        turbo: @is_turbo
      })

      if @is_turbo
        search_params = query.find_by(options[:primary_keys]).to_elasticsearch

        result = @esclient.search(index: index, body: search_params)["hits"]["hits"][0]
        raise StandardError.new("Record not found") if result == nil
        result["_source"]
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
      index = "table_records_#{@table_id}"
      page = options[:page] || 1
      limit = options[:limit] || 5
      query = Powerbase::QueryCompiler.new({
        table_id: @table_id,
        adapter: @powerbase_database.adapter,
        turbo: @is_turbo,
      })

      if @is_turbo
        search_params = query.find_by(options[:filters]).to_elasticsearch
        search_params[:from] = (page - 1) * limit
        search_params[:size] = limit
        result = @esclient.search(index: index, body: search_params)
        result["hits"]["hits"].map {|result| result["_source"]}
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
      index = "table_records_#{@table_id}"
      page = options[:page] || 1
      limit = options[:limit] || @powerbase_table.page_size
      query = Powerbase::QueryCompiler.new({
        table_id: @table_id,
        query: options[:query],
        filter: options[:filters],
        sort: options[:sort],
        adapter: @powerbase_database.adapter,
        turbo: @is_turbo
      })

      if @is_turbo
        search_params = query.to_elasticsearch
        search_params[:from] = (page - 1) * limit
        search_params[:size] = limit
        result = @esclient.search(index: index, body: search_params)

        result["hits"]["hits"].map {|result| result["_source"].merge("doc_id": result["_id"])}
      else
        remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query.to_sequel)
            .paginate(page, limit)
            .all
        }
      end
    end

    # * Get total table records.
    # Accepts the following options:
    # :query :: a string that contains the search query for the records.
    # :filter :: a JSON that contains the filter for the records.
    def get_count(options)
      query = Powerbase::QueryCompiler.new({
        table_id: @table_id,
        query: options[:query],
        sort: false,
        filter: options[:filters],
        adapter: @powerbase_database.adapter,
        turbo: @is_turbo,
      })

      if @is_turbo
        index = "table_records_#{@table_id}"
        search_params = query.to_elasticsearch
        response = @esclient.perform_request("GET", "#{index}/_count", {}, search_params).body
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
        sequel_connect(@powerbase_database) do |db|
          yield(db) if block_given?
        end
      end

      def sanitize(string)
        string.gsub(/['"]/,'')
      end
  end
end