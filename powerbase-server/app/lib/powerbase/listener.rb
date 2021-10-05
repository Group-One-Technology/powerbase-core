module Powerbase
  class Listener
    attr_accessor :connection_string, :db

    def initialize(powerbase_db)
      @connection_string = powerbase_db.connection_string
    end


    def listen!
      @db = Sequel.connect(connection_string) do |database|
        loop do
          database.listen("table_update") do |ev, pid, payload|
            payload_hash = JSON.parse(payload)
            table_name = payload_hash["table"]
            object_id = payload_hash["id"]
            event_type = payload_hash["type"]
            
            table = database.from(table_name.to_sym)
            row = table.where(:id => object_id).first
            
            binding.pry
            
          end
        end
      end
    end
  end
end