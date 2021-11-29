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

    # * Save multiple documents of a table to Elasticsearch.
    def index_records
      index = @powerbase_table.index_name
      fields = @powerbase_table.fields
      primary_keys = @powerbase_table.primary_keys
      order_field = primary_keys.length > 0 ? primary_keys.first : fields.first
      number_field_type = PowerbaseFieldType.find_by(name: "Number")
      date_field_type = PowerbaseFieldType.find_by(name: "Date")
      adapter = @powerbase_database.adapter

      if !@esclient.indices.exists(index: index)
        @esclient.indices.create(
          index: index,
          body: {
            settings: { "index.mapping.ignore_malformed": true },
          }
        )
      end

      if !@powerbase_table.logs["migration"]
        total_records = remote_db() {|db| db.from(@table_name).count }

        @powerbase_table.logs["migration"] = {
          total_records: total_records,
          offset: 0,
          indexed_records: 0,
          start_time: Time.now,
          end_time: nil,
          errors: [],
        }

        @powerbase_table.save
      end

      puts "#{Time.now} Saving #{@powerbase_table.logs["migration"]["total_records"]} documents at index #{index}..."

      indexed_records = @powerbase_table.logs["migration"]["indexed_records"] || 0

      while @powerbase_table.logs["migration"]["offset"] < @powerbase_table.logs["migration"]["total_records"]
        records = remote_db() {|db|
          table = db.from(@table_name)
          table_select = [ Sequel.lit("*") ]
          table_select << Sequel.lit("oid") if adapter == "postgresql" && @powerbase_database.has_row_oid_support?
          table.select(*table_select)
            .order(order_field.name.to_sym)
            .limit(DEFAULT_PAGE_SIZE)
            .offset(@powerbase_table.logs["migration"]["offset"])
            .all
        }

        records.each do |record|
          doc_id = get_doc_id(primary_keys, record, fields, adapter)

          doc = {}
          record.collect {|key, value| key }.each do |key|
            cur_field = fields.find {|field| field.name.to_sym == key }

            if cur_field
              doc[key] = case cur_field.powerbase_field_type_id
                when number_field_type.id
                  record[key]
                when date_field_type.id
                  date = DateTime.parse(record[key]) rescue nil
                  if date != nil
                    date.utc.strftime("%FT%T.%L%z")
                  else
                    record[key]
                  end
                else
                  %Q(#{record[key]})
                end
            end
          end

          doc = doc.slice!(:oid)

          # if !primary_keys.length > 0 && @powerbase_database.adapter == "postgresql" && record[:ctid]
          #   ctid_key = "__ctid_table_#{table_id}"
          #   doc[ctid_key] = record[:ctid]
          # end

          if doc_id != nil
            @esclient.update(
              index: index,
              id: format_doc_id(doc_id),
              body: {
                doc: doc,
                doc_as_upsert: true
              }
            )

            indexed_records += 1
          else
            @powerbase_table.logs["migration"]["errors"].push({
              type: "Elasticsearch",
              error: "Failed to generate doc_id for record in table with id of #{@table_id}",
              record: record,
            })
            @powerbase_table.save
          end
        end

        @powerbase_table.logs["migration"]["offset"] = @powerbase_table.logs["migration"]["offset"] + DEFAULT_PAGE_SIZE
        @powerbase_table.save
      end

      @powerbase_table.logs["migration"]["indexed_records"] = indexed_records
      @powerbase_table.logs["migration"]["end_time"] = Time.now
      @powerbase_table.save
    end


    # Updates a property in a document/table record.
    # Accepts the following options:
    # :id :: the document ID or the SWR key.
    # :primary_keys :: an object of the table's primary keys.
    # Ex: { pathId: 123, userId: 1245 }
    def update_record(options)
      index = "table_records_#{@table_id}"

      if !@esclient.indices.exists(index: index)
        @esclient.indices.create(
          index: index,
          body: {
            settings: { "index.mapping.ignore_malformed": true },
          }
        )
      end

      primary_keys = options[:primary_keys]
      identifier_fields = options[:fields]
      id = if primary_keys.length > 0
        primary_keys.collect {|key, value| "#{key}_#{primary_keys[key]}"}.join("-")
        elsif options[:id]
          options[:id]
        elsif identifier_fields.length > 0
          identifier_fields.collect {|key, _| "#{key}_#{identifier_fields[key]}"}.join("-")
      end
      response = @esclient.update(index: index, id: id, body: { doc: options[:data] }, _source: true)
      response
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