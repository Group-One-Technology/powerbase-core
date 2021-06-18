module Powerbase
  class Model
    # Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(table_id)
      @table_id = table_id
      @esclient = Elasticsearch::Client.new

      @es_table = @esclient.get(index: "powerbase_tables", id: table_id, ignore: 404)
      @is_turbo = !!@es_table['found']

      if @is_turbo
        @es_table = @es_table['_source']
        @table_name = @es_table['name']
        @es_database = @esclient.get(index: "powerbase_databases", id: @es_table['powerbase_database_id'])['_source']
      else
        connect_remote_db(table_id)
        @table_name = @powerbase_table.name
      end
    end

    # Disconnects to the remote database
    def disconnect
      Powerbase.disconnect if !@is_turbo
    end

    # Save a document of a table to Elasticsearch.
    def index_record(record)
      puts "Saving document at index table_records_#{@table_id}..."
      @esclient.index(index: "table_records_#{@table_id}", body: record)
    end

    # Save multiple documents of a table to Elasticsearch.
    def index_records
      connect_remote_db(table_id)
      records = @remote_table.all
      index = "table_records_#{@table_id}"

      puts "Saving #{records.length} documents at index #{index}..."

      @esclient.indices.create(index: index, body: nil)
      records.each {|record| @esclient.index(index: index, body: record) }

      puts "Finished saving #{records.length} documents at index #{index}..."
    end

    # Retrieve all table records.
    def all
      if @is_turbo
        puts "Retrieving max of 1000 table #{@table_id}'s records from elasticsearch..."
        # TODO: Add pagination
        result = @esclient.search(
          index: "table_records_#{@table_id}",
          body: {
            from: 0,
            size: 1000,
            query: { match_all: {} }
          }
        )

        result['hits']['hits'].map {|result| result['_source']}
      else
        puts "Retrieving table #{@table_id}'s records from remote database..."
        @remote_table.all
      end
    end

    # Filter the table records.
    def filter(filter_params)
      index = "table_records_#{@table_id}"

      if @is_turbo
        filter = { query: { bool: {} } }

        predicates = ["lt", "gt", "lte", "gte", "eq", "not_eq", "matches"]

        field_mappings = @esclient.perform_request("GET", "#{index}/_mappings").body[index]
        field_mappings = field_mappings['mappings']['properties']

        filter_params.each do |key, val|
          dup_key = key.dup
          field_key = dup_key.gsub(/\_(#{predicates.join("|")})$/, "")&.to_sym
          predicate = dup_key.sub!(/^#{field_key}_/, "")

          if ["lt", "gt", "lte", "gte"].include? predicate
            filter[:query][:bool][:filter] = [] if !filter[:query][:bool].key?(:filter)

            range_filter = {}
            range_filter[field_key] = {}
            range_filter[field_key][predicate.to_sym] = val

            filter[:query][:bool][:filter].push({ range: range_filter })
          elsif predicate == "matches"
            filter[:query][:bool][:must] = [] if !filter[:query][:bool].key?(:must)

            wildcard_filter = {}
            wildcard_filter[field_key] = val

            filter[:query][:bool][:must].push({ match_phrase: wildcard_filter })
          elsif predicate == nil or predicate == "eq"
            filter[:query][:bool][:filter] = [] if !filter[:query][:bool].key?(:filter)

            current_field_mapping = field_mappings.find {|k, v| k.to_s == field_key.to_s}

            filter_field_key = if current_field_mapping && current_field_mapping[1]['type'] == "date"
                field_key.to_sym
              elsif val.is_a?(String)
                "#{field_key}.keyword".to_sym
              else
                field_key.to_sym
              end

            term_filter = {}
            term_filter[filter_field_key] = val

            filter[:query][:bool][:filter].push({ term: term_filter })
          end
        end

        result = @esclient.search(
          index: "table_records_#{@table_id}",
          body: filter
        )

        result['hits']['hits'].map {|result| result['_source']}
      else
        Philtre.new(filter_params).apply(@remote_table)
      end
    end

    private
      def connect_remote_db(table_id)
        @powerbase_table = PowerbaseTable.find(table_id)
        @powerbase_database = PowerbaseDatabase.find(@powerbase_table.powerbase_database_id)
        Powerbase.connect({
          adapter: @powerbase_database.adapter,
          connection_string: @powerbase_database.connection_string,
          is_turbo: @powerbase_database.is_turbo,
        })
        @remote_table = Powerbase.DB.from(@powerbase_table.name)
      end
  end
end