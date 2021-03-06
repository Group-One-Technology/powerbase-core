
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
        error_message = "#{Time.now} -- Failed to index doc_id#{doc_id} with size of #{doc_size} bytes in table##{table.id}. The document size limit is 80MB"
        puts error_message
        Sentry.capture_message(error_message)
        table.write_migration_logs!(error: { type: "Elasticsearch", error: error_message })
        false
      else
        true
      end
    end

    def listen!
      begin
        @db = powerbase_db._sequel
  
        if !@db == nil
          # TODO drop trigger for undefined bases.
          raise StandardError.new("#{Time.now} -- Unable to listen to database##{@powerbase_db.id}. Sequel db is undefined")
        end

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
        end
      rescue Sequel::DatabaseConnectionError => ex
        if powerbase_db != nil && @db&.pool != nil
          pool_size = @db.pool.size
          powerbase_db.update(max_connections: pool_size || 0)

          Sentry.set_context('pool_size', {
            pool_size: pool_size,
            database_id: powerbase_db.id,
          })
        end

        Sentry.capture_exception(ex)
      rescue => ex
        Sentry.capture_exception(ex)
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
        # Check if table is already saved in powerbase
        powerbase_table = PowerbaseTable.find_by(name: table_name, powerbase_database_id: powerbase_db.id)
        return if powerbase_table != nil

        # Create powerbase table
        table_creator = Tables::Creator.new table_name, powerbase_db, order: powerbase_db.tables.length + 1
        table_creator.save
        powerbase_table = table_creator.object

        # Migrate added columns
        begin
          table_schema = database.schema(table_name.to_sym)
          table_foreign_keys = database.foreign_key_list(table_name.to_sym)
        rescue Sequel::Error => ex
          if ex.message.include?("schema parsing returned no columns")
            table_schema = []
          else
            raise ex
          end
        end

        table = Tables::Syncer.new powerbase_table, schema: table_schema, foreign_keys: table_foreign_keys, new_table: true
        table.sync!

        # Clear cached table schema
        database.instance_variable_get(:@schemas).clear

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "table-migration-listener", { table_id: powerbase_table.id }.to_json)
      when "ALTER TABLE"
        powerbase_table = powerbase_db.tables.find_by name: table_name
        puts "#{Time.now} -- Schema changes detected on table##{powerbase_table.id} #{table_name}."

        # Migrate added/dropped/renamed/updated columns
        begin
          table_schema = database.schema(table_name.to_sym)
          table_foreign_keys = database.foreign_key_list(table_name.to_sym)
        rescue Sequel::Error => ex
          if ex.message.include?("schema parsing returned no columns")
            table_schema = []
          else
            raise ex
          end
        end

        table = Tables::Syncer.new powerbase_table, schema: table_schema, foreign_keys: table_foreign_keys
        table.sync!

        # Clear cached table schema
        database.instance_variable_get(:@schemas).clear

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "table-migration-listener", { table_id: powerbase_table.id }.to_json)
      when "DROP TABLE"
        schema_name, table_name = object_identity.split(".")
        powerbase_table = powerbase_db.tables.find_by name: table_name

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
      powerbase_table = powerbase_db.tables.find_by name: table_name

      puts "#{Time.now} -- Data changes detected on table##{powerbase_table.id} #{table_name}"

      index_name = powerbase_table.index_name
      fields = powerbase_table.fields
      doc_id = format_doc_id(primary_key_value)
      Sentry.set_context('record', {
        doc_id: doc_id,
        table_id: powerbase_table.id,
        database_id: powerbase_db.id,
        action: event_type
      })

      # Notify client for inserted/updated records in remote db for non turbo bases.
      if !powerbase_db.is_turbo && event_type != "DELETE"
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener",  {doc_id: doc_id}.to_json)
        return
      end

      case event_type
      when "INSERT"
        record = table.where(primary_key_value.symbolize_keys).first
        record = format_record(record, fields)

        if !record
          puts "#{Time.now} -- No inserted record found."
          return
        end

        return if !can_index?(record, doc_id, powerbase_table)
        Sentry.set_context('doc_size', { doc_size: get_doc_size(record) })

        # Upsert elasticsearch record
        begin
          update_record(index_name, doc_id, record)
        rescue Elasticsearch::Transport::Transport::Errors::Conflict => error
          puts error
          sleep 1
          # Try again after a few seconds.
          update_record(index_name, doc_id, record)
        end

        # Notify changes to client
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener",  {doc_id: doc_id}.to_json)
      when "UPDATE"
        # Query get record
        records = sequel_get_records(database, table_name)
        record = records.where(primary_key_value.symbolize_keys).first
        record = format_record(record, fields)

        if !record
          puts "#{Time.now} -- No updated record found."
          return
        end

        return if !can_index?(record, doc_id, powerbase_table)
        Sentry.set_context('doc_size', { doc_size: get_doc_size(record) })

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
        pusher_trigger!("table.#{powerbase_table.id}", "powerbase-data-listener", {doc_id: doc_id}.to_json)
      end
    end

    protected
      def deny_access(exception)
      # ...
      end
  end
end