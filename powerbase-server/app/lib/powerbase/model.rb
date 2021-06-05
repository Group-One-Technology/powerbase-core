module Powerbase
  class Model
    def initialize(table_id, table_name)
      @table_id = table_id
      @table = Powerbase.DB.from(table_name)
      @client = Elasticsearch::Client.new
    end

    def records()
      @table.all
    end

    def insert_record(record)
      if Powerbase.is_turbo
        puts "Saving document in table_records_#{@table_id} index..."
        @client.index(index: "table_records_#{@table_id}", body: record)
      end
    end

    def insert_records
      puts "Saving documents in table_records_#{@table_id} index..."

      self.records.each {|record|
        @client.index(index: "table_records_#{@table_id}", body: record) if Powerbase.is_turbo
      }

      puts "Finished saving #{self.records.length} documents in table_records_#{@table_id} index..."
    end
  end
end