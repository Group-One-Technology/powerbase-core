
module Powerbase
  class Listener
    include ElasticsearchHelper
    include SequelHelper
    include PusherHelper

    attr_accessor :db, :powerbase_db

    def initialize(powerbase_db)
      @powerbase_db = powerbase_db
    end

    def listen!
      @db = powerbase_db._sequel
      begin
        @db.listen("powerbase_table_update", :loop => true) do |ev, pid, payload|
          notifier_callback(ev, pid, payload)
        end
      rescue => ex
        puts "#{Time.now} -- Listener Error for Database##{@powerbase_db.id}}"
        puts ex
      end
    end

    def notifier_callback(ev, pid, payload)
      payload_hash = JSON.parse(payload)
      table_name = payload_hash["table"]
      primary_key_value = payload_hash["primary_key"]
      event_type = payload_hash["type"]
      record = payload_hash["data"]
      powerbase_table = powerbase_db.tables.turbo.find_by name: table_name

      index_name = powerbase_table.index_name
      doc_id = format_doc_id(primary_key_value)

      puts "#{Time.now} -- Data changes detect on table##{powerbase_table.id} #{table_name}"

      case event_type
      when "INSERT"
        if !record
          puts "#{Time.now} -- No inserted record provided in payload"
          return
        end

        # Upsert elasticsearch record
        update_record(index_name, doc_id, record)

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener", record.merge(doc_id: doc_id))
      when "UPDATE"
        if !record
          puts "#{Time.now} -- No updated record provided in payload"
          return
        end


        # Update elasticsearch record
        begin
          update_record(index_name, doc_id, record)
        rescue Elasticsearch::Transport::Transport::Errors::Conflict => error
          puts error
          sleep 1
          # Try again after a few seconds.
          update_record(index_name, doc_id, record)
        end

        # Wait for changes to reflect on Elasticsearch before querying it.
        sleep 0.75 if Rails.env.development?

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener", {doc_id: doc_id}.to_json)
      when "DELETE"
        # Update elasticsearch record
        delete_record(index_name, doc_id)

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener", {doc_id: doc_id})
      end
    end
  end
end