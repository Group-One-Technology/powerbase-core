require "sequel/plugins/elasticsearch"

module Powerbase
  class Model
    # Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(esclient, table_id)
      @table_id = table_id
      @esclient = esclient

      @es_table = @esclient.get(index: "powerbase_tables", id: table_id, ignore: 404)
      @is_turbo = !!@es_table["found"]
      connect_remote_db(table_id)

      if @is_turbo
        @es_table = @es_table["_source"]
        @table_name = @es_table["name"]
        @es_database = @esclient.get(index: "powerbase_databases", id: @es_table['powerbase_database_id'])["_source"]
      else
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
      connect_remote_db(@table_id)
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
            size: 10000,
            query: { match_all: {} }
          }
        )

        result["hits"]["hits"].map {|result| result["_source"]}
      else
        puts "Retrieving table #{@table_id}'s records from remote database..."
        @remote_table.all
      end
    end

    # Filter the table records.
    def filter(filter_params)
      index = "table_records_#{@table_id}"

      if @is_turbo
        model = Class.new(Sequel::Model(@remote_table)) do
          plugin :elasticsearch, index: index
        end

        model.es(parse_elasticsearch_filter(filter_params))
      else
        @remote_table.where(eval(parse_sequel_filter(filter_params)))
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

      def parse_value(value)
        if value.key?("field")
          @is_turbo ? value["field"] : "Sequel.lit('\"#{value["field"]}\"')"
        elsif value.key?("value")
          if !@is_turbo && value["value"].is_a?(String)
            "'#{value["value"]}'"
          else
            value["value"]
          end
        end
      end

      def parse_sequel_filter(filters)
        return if !filters&.length

        result = ""
        filters.each do |key, value|
          first_val = parse_value(value[0])
          second_val = parse_value(value[1])

          if key == "eq"
            result += "(Sequel[{#{first_val} => #{second_val}}])"
          elsif key == "neq"
            result += "(Sequel.~(#{first_val} => #{second_val}))"
          elsif key == "gt"
            result += "(#{first_val} > #{second_val})"
          elsif key == "gte"
            result += "(#{first_val} > #{second_val}) | (Sequel[{#{first_val} => #{second_val}}])"
          elsif key == "lt"
            result += "(#{first_val} < #{second_val})"
          elsif key == "lte"
            result += "(#{first_val} < #{second_val}) | (Sequel[{#{first_val} => #{second_val}}])"
          elsif key == "like"
            result += "(Sequel.like(#{first_val}, #{second_val}))"
          end
        end

        result
      end

      def parse_elasticsearch_filter(filters)
        return if !filters&.length

        result = ""
        filters.each do |key, value|
          first_val = parse_value(value[0])
          second_val = parse_value(value[1])

          if key == "eq"
            result += "(#{first_val}:\"#{second_val}\")"
          elsif key == "neq"
            result += "(NOT #{first_val}:\"#{second_val}\")"
          elsif key == "gt"
            result += "(#{first_val}:>#{second_val})"
          elsif key == "gte"
            result += "(#{first_val}:>=#{second_val})"
          elsif key == "lt"
            result += "(#{first_val}:<#{second_val})"
          elsif key == "lte"
            result += "(#{first_val}:<=#{second_val})"
          elsif key == "like"
            result += "(#{first_val}:#{second_val})"
          end
        end

        result
      end
  end
end