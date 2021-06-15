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
        @es_database = @esclient.get(index: "powerbase_databases", id: @es_table['powerbase_database_id'])['_source']
        @remote_table = Powerbase.DB.from(@es_table['name'])
      else
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

    # Retrieve the table records.
    def records
      if @is_turbo
        puts "Retrieving max of 100 table #{@table_id}'s records from elasticsearch..."
        # TODO: Add pagination
        result = @esclient.search(
          index: "table_records_#{@table_id}",
          body: {
            from: 0,
            size: 100,
            query: { match_all: {} }
          }
        )

        result['hits']['hits'].map {|result| result['_source']}
      else
        puts "Retrieving table #{@table_id}'s records from remote database..."
        @remote_table.all
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
      records = @remote_table.all
      index = "table_records_#{@table_id}"

      puts "Saving #{records.length} documents at index #{index}..."

      @esclient.indices.create(index: index, body: nil)
      records.each {|record| @esclient.index(index: index, body: record) }

      puts "Finished saving #{records.length} documents at index #{index}..."
    end
  end
end