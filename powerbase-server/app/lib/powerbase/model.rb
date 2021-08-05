module Powerbase
  class Model
    # * Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(esclient, table_id)
      @table_id = table_id
      @esclient = esclient

      @powerbase_table = PowerbaseTable.find(table_id)
      @powerbase_database = PowerbaseDatabase.find(@powerbase_table.powerbase_database_id)
      @table_name = @powerbase_table.name
      @is_turbo = @powerbase_database.is_turbo
    end

    # * Save a document of a table to Elasticsearch.
    def index_record(record)
      puts "Saving document at index table_records_#{@table_id}..."
      @esclient.index(index: "table_records_#{@table_id}", body: record)
    end

    # * Save multiple documents of a table to Elasticsearch.
    def index_records
      index = "table_records_#{@table_id}"
      fields = PowerbaseField.where(powerbase_table_id: @table_id)
      primary_keys = fields.select {|field| field.is_primary_key }

      records = remote_db() {|db|
        table = db.from(@table_name)
        total_records = table.count

        puts "#{Time.now} Saving #{total_records} documents at index #{index}..."

        @esclient.indices.create(index: index, body: nil)

        table.select(Sequel.lit('ctid'), Sequel.lit('*')).paged_each {|record|
          doc_id = if primary_keys.length > 0
              primary_keys
                .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
                .join("-")
            else
              # * Note: Only works for PostgreSQL
              "ctid_#{record[:ctid]}"
            end

          doc_body = record.slice!(:ctid)

          if @esclient.exists(index: index, id: doc_id)
            @esclient.update(index: index, id: doc_id, body: doc_body)
          else
            @esclient.index(index: index, id: doc_id, body: doc_body)
          end
        }
      }
    end

    # * Get the filtered and paginated table records.
    # Accepts the following options:
    # :filter :: a JSON that contains the filter for the records.
    # :page :: the page number.
    # :limit :: the page count. No. of records to get per paage.
    def get(options)
      index = "table_records_#{@table_id}"
      page = options[:page] || 1
      limit = options[:limit] || @powerbase_table.page_size

      if @is_turbo
        search_params = {
          from: (page - 1) * limit,
          size: limit,
        }

        if options[:filters]
          search_params[:query] = {
            query_string: {
              query: parse_elasticsearch_filter(options[:filters])
            }
          }
        end

        result = @esclient.search(
          index: "table_records_#{@table_id}",
          body: search_params
        )

        result["hits"]["hits"].map {|result| result["_source"]}
      else
        remote_db() {|db|
          db.from(@table_name)
            .where(options[:filters] ? eval(parse_sequel_filter(options[:filters])) : true)
            .paginate(page, limit)
            .all
        }
      end
    end

    # * Get total table records.
    # Accepts the following options:
    # :filter :: a JSON that contains the filter for the records.
    def get_count(options)
      if @is_turbo
        index = "table_records_#{@table_id}"
        query = if options[:filters]
            "q=#{parse_elasticsearch_filter(options[:filters])}"
          else
            nil
          end

        response = @esclient.perform_request("GET", "#{index}/_count?#{query}").body
        response["count"]
      else
        remote_db() {|db|
          db.from(@table_name)
            .where(options[:filters] ? eval(parse_sequel_filter(options[:filters])) : true)
            .count
        }
      end
    end

    private
      def remote_db(&block)
        Powerbase.connect({
          adapter: @powerbase_database.adapter,
          connection_string: @powerbase_database.connection_string,
          is_turbo: @powerbase_database.is_turbo,
        }, &block)
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