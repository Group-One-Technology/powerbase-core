
include ElasticsearchHelper
include SequelHelper
include PusherHelper

module Powerbase
  class Listener

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
          # Checking if listening database has been disconnected
          existing_db = PowerbaseDatabase.find powerbase_db.id

          payload_hash = JSON.parse(payload)

          if payload_hash["trigger_type"] == "event_trigger"
            event_notifier_callback(@db, ev, pid, payload_hash)
          else
            notifier_callback(@db, ev, pid, payload_hash)
          end
        end
      rescue ActiveRecord::RecordNotFound => ex
        if ex.message.include?("Couldn't find PowerbaseDatabase")
          puts "#{Time.now} -- Database listener disconnected. #{ex.message}."
        else
          raise ex
        end
      rescue => ex
        puts "#{Time.now} -- Listener Error for Database##{powerbase_db.id}"
        raise ex
      end
    end

    def event_notifier_callback(database, ev, pid, payload)
      table_name = payload["table"]
      column_name = payload["column"]
      object_identity = payload["object"]
      schema_name = payload["schema_name"]
      command_tag = payload["command_tag"]
      object_type = payload["object_type"]

      case command_tag
      when "CREATE TABLE"
        puts "#{Time.now} -- New table named #{table_name} detected."
        # Create powerbase table
        table_creator = Tables::Creator.new table_name, powerbase_db.tables.length + 1, powerbase_db
        table_creator.save
        powerbase_table = table_creator.object

        # Migrate added columns
        begin
          table_schema = database.schema(table_name.to_sym)
        rescue Sequel::Error => ex
          if ex.message.include?("schema parsing returned no columns")
            table_schema = []
          else
            raise ex
          end
        end

        table = Tables::Syncer.new powerbase_table, schema: table_schema
        table.sync!

        # Clear cached table schema
        database.instance_variable_get(:@schemas).clear

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "table-migration-listener", { table_id: powerbase_table.id }.to_json)
      when "ALTER TABLE"
        powerbase_table = powerbase_db.tables.turbo.find_by name: table_name
        puts "#{Time.now} -- Schema changes detected on table##{powerbase_table.id} #{table_name}."

        # Migrate added/dropped/renamed columns
        begin
          table_schema = database.schema(table_name.to_sym)
        rescue Sequel::Error => ex
          if ex.message.include?("schema parsing returned no columns")
            table_schema = []
          else
            raise ex
          end
        end

        table = Tables::Syncer.new powerbase_table, schema: table_schema
        table.sync!

        # Clear cached table schema
        database.instance_variable_get(:@schemas).clear

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "table-migration-listener", { table_id: powerbase_table.id }.to_json)
      when "DROP TABLE"
        schema_name, table_name = object_identity.split(".")
        powerbase_table = powerbase_db.tables.turbo.find_by name: table_name
        if !powerbase_table
          # TODO: resync database
        end

        puts "#{Time.now} -- Dropped table##{powerbase_table.id} #{table_name} detected."
        table_id = powerbase_table.id

        # Remove powerbase table
        powerbase_table.remove

        # Notify changes to client
        pusher_trigger!("database.#{powerbase_db.id}", "migration-listener", { table_id: table_id, action: "drop" }.to_json)
      end
    end

    def notifier_callback(database, ev, pid, payload)
      table_name = payload["table"]
      primary_key_value = payload["primary_key"]
      event_type = payload["type"]
      table = database.from(table_name.to_sym)
      powerbase_table = powerbase_db.tables.turbo.find_by name: table_name

      puts "#{Time.now} -- Data changes detected on table##{powerbase_table.id} #{table_name}"

      index_name = powerbase_table.index_name
      fields = powerbase_table.fields
      doc_id = format_doc_id(primary_key_value)

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
        # Delete elasticsearch record
        begin
          delete_record(index_name, doc_id)
        rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
          puts "#{Time.now} -- Not found doc_id: #{doc_id}"
        end

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener", {doc_id: doc_id})
      end
    end
  end
end