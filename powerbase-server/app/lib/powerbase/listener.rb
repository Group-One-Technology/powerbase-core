
module Powerbase
  class Listener
    include ElasticsearchHelper
    include SequelHelper
    include PusherHelper

    attr_accessor :db, :powerbase_db

    def initialize(powerbase_db)
      @powerbase_db = powerbase_db
    end

    def can_index?(record, doc_id, table)
      doc_size = get_doc_size(record)
      if !is_indexable?(doc_size)
        error_message = "#{Time.now} -- Failed to index doc_id#{doc_id} with size of #{doc_size} bytes in table##{table.id}. The document size limit is 100MB"
        puts error_message
        Sentry.capture_message(error_message)
        table.write_migration_logs!(error: { type: "Elasticsearch", error: error_message })
        false
      else
        true
      end
    end

    def listen!
      @db = powerbase_db._sequel

      if !@db == nil
        # TODO drop trigger for undefined bases.
        raise StandardError.new("#{Time.now} -- Unable to listen to database##{@powerbase_db.id}. Sequel db is undefined")
      end

      begin
        @db.listen("powerbase_table_update", :loop => true) do |ev, pid, payload|
          notifier_callback(@db, ev, pid, payload)
        end
      rescue => ex
        puts "#{Time.now} -- Listener Error for Database##{@powerbase_db.id}"
        raise ex
      end
    end

    def notifier_callback(database, ev, pid, payload)
      payload_hash = JSON.parse(payload)
      table_name = payload_hash["table"]
      primary_key_value = payload_hash["primary_key"]
      event_type = payload_hash["type"]
      table = database.from(table_name.to_sym)
      powerbase_table = powerbase_db.tables.turbo.find_by name: table_name

      index_name = powerbase_table.index_name
      fields = powerbase_table.fields
      doc_id = format_doc_id(primary_key_value)

      puts "#{Time.now} -- Data changes detect on table##{powerbase_table.id} #{table_name}"

      case event_type
      when "INSERT"
        record = table.where(primary_key_value.symbolize_keys).first
        record = format_record(record, fields)

        if !record
          puts "#{Time.now} -- No inserted record found."
          return
        end

        return if !can_index?(record, doc_id, table)

        # Upsert elasticsearch record
        update_record(index_name, doc_id, record)

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener", record.merge(doc_id: doc_id))
      when "UPDATE"
        # Query get record
        records = sequel_get_records(database, table_name)
        record = records.where(primary_key_value.symbolize_keys).first
        record = format_record(record, fields)

        if !record
          puts "#{Time.now} -- No updated record found."
          return
        end

        return if !can_index?(record, doc_id, table)

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