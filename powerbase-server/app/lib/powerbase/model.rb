module Powerbase
  class Model
    def initialize(table_id, table_name)
      @table_id = table_id
      @table = Powerbase.DB.from(table_name)
      @client = Elasticsearch::Client.new
    end

    def records
      if Powerbase.is_turbo
        puts "Retrieving 100 table #{@table_id}'s records from elasticsearch..."
        # TODO: Add pagination
        result = @client.search(
          index: "table_records_#{@table_id}",
          body: {
            from: 0,
            size: 100,
            query: { match_all: {} }
          }
        )

        result['hits']['hits'].map {|result| result['_source']}
      else
        @table.all
      end
    end

    def index_record(record)
      puts "Saving document at index table_records_#{@table_id}..."
      @client.index(index: "table_records_#{@table_id}", body: record)
    end

    def index_records
      records = @table.all
      puts "Saving #{records.length} documents at index table_records_#{@table_id}..."

      records.each {|record| @client.index(index: "table_records_#{@table_id}", body: record) }

      puts "Finished saving #{records.length} documents at index table_records_#{@table_id}..."
    end
  end
end