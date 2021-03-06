class Tables::Migrator
  include ElasticsearchHelper
  include SequelHelper
  include FieldTypeHelper
  include PusherHelper

  attr_accessor :table, :index_name, :primary_keys,
                :order_field, :adapter, :fields, :offset,
                :indexed_records, :total_records, :total_indexed_records, :records,
                :database, :in_synced

  def initialize(table)
    @table = table
    @index_name = table.index_name
    @fields = table.fields.reload
    @primary_keys = table.primary_keys.reload
    @order_field = primary_keys.first || (table.is_virtual ? fields.first : table.actual_fields.first)
    @adapter = table.db.adapter
    @database = table.db
    @offset = table.logs["migration"]["offset"] || 0
    @indexed_records = table.logs["migration"]["indexed_records"] || 0

    if !table.is_virtual
      @total_records = sequel_connect(@database) {|db| db.from(table.name).count}
    end
  end

  def total_indexed_records
    @total_indexed_records ||= Powerbase::Model.new(@table).get_count
  end

  def in_synced?
    if @table.is_virtual
      true
    elsif @database.is_turbo
      @in_synced ||= @total_records == total_indexed_records
    else
      has_virtual_fields = fields.any?{|field| field.is_virtual}
      @in_synced ||= has_virtual_fields ? @total_records >= total_indexed_records : true
    end
  end

  def index!
    create_index!(index_name)
    table.write_migration_logs!(total_records: total_records)
    actual_fields = fields.select {|field| !field.is_virtual}
    old_primary_keys = Array(table.logs["migration"]["old_primary_keys"])

    if table.is_virtual && old_primary_keys.length === 0
      set_table_as_migrated
      return
    end

    # Reset all migration counter logs when first time indexing or when re-indexing.
    if table.logs["migration"]["start_time"] == nil || (!in_synced && table.status != "indexing_records") || table.is_virtual || old_primary_keys.length > 0
      @offset = 0
      @indexed_records = 0
      table.write_migration_logs!(
        indexed_records: 0,
        offset: 0,
        start_time: Time.now,
      )

      # Set every doc under index to be _in_synced = false
      # This is to detect deleted records on re-indexing.
      batch_update_records(index_name, {
        conflicts: "proceed",
        script: "ctx._source._in_synced = false",
        query: {
          query_string: { query: "NOT _exists_:_in_synced" }
        },
      })
    end

    table.write_migration_logs!(status: "indexing_records")

    if (!table.is_virtual && total_records.zero?) || (table.is_virtual && total_indexed_records.zero?)
      puts "#{Time.now} -- Indexing done. No record found for table##{table.id}"
      set_table_as_migrated
      return
    end

    puts "#{Time.now} -- Saving #{total_records} documents at index #{index_name} table##{table.id}..."

    while (!table.is_virtual && offset < total_records) || (table.is_virtual && offset < total_indexed_records)
      fetch_table_records!

      records.each do |record|
        doc = format_record(record.symbolize_keys, fields)
        doc_id = get_doc_id(primary_keys, doc, table.is_virtual ? fields : actual_fields)
        puts "#{Time.now} -- Record to index at #{index_name} DOC_ID: #{doc_id}"

        begin
          doc_size = get_doc_size(doc)

          if !table.is_virtual && !is_indexable?(doc_size)
            error_message = "Failed to index doc_id#{doc_id} with size of #{doc_size} bytes in table##{table.id}. The document size limit is 80MB"
            puts error_message
            Sentry.set_context('record', {
              doc_id: doc_id,
              doc_size: doc_size,
            })
            Sentry.capture_message(error_message)
            table.write_migration_logs!(error: { type: "Elasticsearch", error: error_message })
            next
          end

          if doc_id.present?
            search_doc_id = nil
            old_doc_id = nil
            old_doc = nil

            # Check if primary keys changed
            if old_primary_keys.length > 0
              primary_key_fields = {}
              old_primary_keys.each do |old_primary_key|
                field_key = old_primary_key.to_sym
                if doc.key?(field_key)
                  cur_field = fields.find {|field| field.name.to_sym == field_key && !field.is_virtual}
                  primary_key_fields[field_key] = doc[field_key] if cur_field != nil
                end
              end

              # Check if there's an existing doc
              if primary_key_fields.length > 0
                search_doc_id = format_doc_id(primary_key_fields)
              end
            else
              # Check if there's an existing doc with no primary keys
              search_doc_id = get_doc_id([], doc, actual_fields)
            end

            # Search and remove doc with old primary keys
            if search_doc_id != nil && search_doc_id != doc_id
              # Search existing doc
              begin
                found_doc = get_record(index_name, search_doc_id)
              rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
                puts "#{Time.now} -- No old document found for doc_id of #{search_doc_id}"
              end

              if found_doc != nil && found_doc.key?("_source")
                old_doc = found_doc["_source"].symbolize_keys
                old_doc_id = search_doc_id

                # Remove the old existing doc
                begin
                  delete_record(index_name, old_doc_id)
                  puts "#{Time.now} -- Deleted old doc_id: #{old_doc_id}"
                rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
                  puts "#{Time.now} -- No old doc_id: #{doc_id}"
                end
              end
            end

            if database.is_turbo || table.is_virtual
              # Merge old document's data with updated doc - Actual and Magic Values (if any)
              if old_doc != nil && old_doc.length > 0
                doc = { **old_doc, **doc }
              end
            # Reindexing for non-turbo bases with virtual fields.
            else
              # Pick virtual and primary key data for doc.
              updated_doc = {}
              existing_doc = old_doc.nil? ? {} : old_doc.symbolize_keys

              virtual_fields = fields.select {|field| field.is_virtual}

              # Search existing doc.
              begin
                found_doc = get_record(index_name, doc_id)
              rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
                found_doc = nil
                puts "#{Time.now} -- No existing document found for doc_id of #{doc_id}"
              end

              if found_doc != nil && found_doc.key?("_source")
                existing_doc = { **existing_doc, **found_doc["_source"] }.symbolize_keys
              end

              existing_doc&.each do |key, value|
                field = virtual_fields.find {|item| item.name.to_sym == key.to_sym}
                updated_doc[key] = value if field != nil
              end

              # Prevent indexing of doc when there are no virtual fields data.
              if updated_doc.length > 0
                doc&.each do |key, value|
                  field = primary_keys.find {|item| item.name.to_sym == key.to_sym}
                  updated_doc[key] = value if field != nil
                end
              end

              doc = updated_doc
            end

            # Upsert formatted doc
            if doc.length > 0
              update_record(index_name, doc_id, { **doc, _in_synced: true })
              @indexed_records += 1
              puts "#{Time.now} -- Saved doc_id: #{doc_id}"
            end
          else
            table.write_migration_logs!(
              error: {
                type: "Elasticsearch",
                error: "Failed to generate doc_id for record in table with id of #{table.id}",
                record: record,
              }
            )
          end
        rescue => exception
          table.write_migration_logs!(
            error: {
              type: "Elasticsearch",
              error: "Failed to index record #{doc_id} in table with id of #{table.id}",
              exception: exception,
            }
          )
        end
      end

      @offset += DEFAULT_PAGE_SIZE

      table.write_migration_logs!(offset: offset, indexed_records: indexed_records)
      begin
        pusher_trigger!("table.#{table.id}", "notifier-migration-listener", {
          id: table.id,
          offset: offset,
          indexed_records: indexed_records,
        })
      rescue => ex
        puts ex
      end
    end

    # Remove deleted indexed records based on _in_synced
    result = search_records(index_name, {
      query: { query_string: {
        query: "_in_synced:false"
      }}
    })
    deleted_records = format_es_result(result)
    if deleted_records.length > 0
      puts "#{Time.now} -- Removing #{deleted_records.count} deleted indexed records."
      deleted_records.each do |record|
        delete_record(index_name, record[:doc_id])
      end
    end

    begin
      # Remove _in_synced column for every doc under index_name
      remove_es_column(index_name, "_in_synced")
    rescue => ex
      puts ex
    end

    table.write_migration_logs!(old_primary_keys: [])
    set_table_as_migrated
  end

  def create_base_connection!(foreign_keys = nil)
    puts "#{Time.now} -- Adding and auto linking connections of table##{table.id}"
    table.write_migration_logs!(status: "adding_connections")

    if !table.is_virtual
      table_foreign_keys = foreign_keys || sequel_connect(database) {|db| db.foreign_key_list(table.name) }
      table_foreign_keys.each do |foreign_key|
        referenced_table = database.tables.find_by(name: foreign_key[:table].to_s)

        if referenced_table
          conn_creator = BaseConnection::Creator.new table, {
            name: foreign_key[:name],
            columns: foreign_key[:columns],
            powerbase_table_id: table.id,
            powerbase_database_id: table.powerbase_database_id,
            referenced_columns: foreign_key[:key],
            referenced_table_id:  referenced_table.id,
            referenced_database_id:  referenced_table.powerbase_database_id,
            is_constraint: true,
          }
          conn_creator.save
        end
      end
    end

    field_primary_keys = table.primary_keys

    table.fields.each do |field|
      if field.name.downcase.end_with? "id"
        referenced_table = field.name.downcase.delete_suffix("id")
        referenced_table = referenced_table.delete_suffix("_") if referenced_table.end_with? "_"
        referenced_table = referenced_table.gsub("_","")

        is_singular = referenced_table.pluralize != referenced_table && referenced_table.singularize == referenced_table

        referenced_table = database.tables.find do |item|
          table_name = item.name.downcase.gsub("_","")

          table_name == referenced_table ||
            (is_singular && table_name == referenced_table.pluralize) ||
            (!is_singular && table_name == referenced_table.singularize)
        end

        if referenced_table && referenced_table.id != table.id
          base_connection = BaseConnection.find_by(
            columns: [field.name],
            powerbase_table_id: table.id,
            powerbase_database_id: table.powerbase_database_id,
            referenced_table_id: referenced_table.id,
            referenced_database_id: referenced_table.powerbase_database_id,
          )

          if !base_connection
            referenced_table_column = referenced_table.primary_keys.first

            base_connection = BaseConnection.new
            base_connection.name = "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{field.name}"
            base_connection.columns = [field.name]
            base_connection.referenced_columns = [referenced_table_column.name]
            base_connection.referenced_table_id = referenced_table.id
            base_connection.referenced_database_id = referenced_table.powerbase_database_id
            base_connection.powerbase_table_id = table.id
            base_connection.powerbase_database_id = table.powerbase_database_id
            base_connection.is_auto_linked = true

            if !base_connection.save
              @base_migration.logs["errors"].push({
                type: "Active Record",
                error: "Failed to save '#{base_connection.name}' base connection",
                messages: base_connection.errors.messages,
              })
              @base_migration.save
            end
          end
        end
      else
        referenced_column = field_primary_keys.find {|item| item.name == field.name}
        other_referenced_columns = referenced_column && field_primary_keys.select {|item|
          item.id != referenced_column.id && item.powerbase_table_id == referenced_column.powerbase_table_id
        }

        if referenced_column && other_referenced_columns.length == 0 && referenced_column.powerbase_table_id != field.powerbase_table_id
          referenced_table = referenced_column.powerbase_table

          base_connection = BaseConnection.find_by(
            columns: [field.name],
            powerbase_table_id: table.id,
            powerbase_database_id: table.powerbase_database_id,
            referenced_table_id: referenced_table.id,
            referenced_database_id: referenced_table.powerbase_database_id,
          )

          if !base_connection
            base_connection = BaseConnection.new
            base_connection.name = "fk_#{table.powerbase_database_id}_#{table.name}_#{referenced_table.powerbase_database_id}_#{referenced_table.name}_#{field.name}"
            base_connection.columns = [field.name]
            base_connection.referenced_columns = [referenced_column.name]
            base_connection.referenced_table_id = referenced_table.id
            base_connection.referenced_database_id = referenced_table.powerbase_database_id
            base_connection.powerbase_table_id = table.id
            base_connection.powerbase_database_id = table.powerbase_database_id
            base_connection.is_auto_linked = true

            if !base_connection.save
              @base_migration.logs["errors"].push({
                type: "Active Record",
                error: "Failed to save '#{base_connection.name}' base connection",
                messages: base_connection.errors.messages,
              })
              @base_migration.save
            end
          end
        end
      end
    end

    table.write_migration_logs!(status: table.is_virtual ? "migrated" : "migrated_connections")
    pusher_trigger!("table.#{table.id}", "connection-migration-listener", { id: table.id })
    pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
  end

  def create_base_connection_later!
    TableConnectionsWorker.perform_async(table.id)
  end

  def create_listener!
    if database.postgresql? && ENV["ENABLE_LISTENER"] == "true"
      table.write_migration_logs!(status: "injecting_data_notifier")
      table.inject_notifier_trigger

      if database.is_superuser
        table.write_migration_logs!(status: "injecting_event_notifier")
        table.inject_notifier_event_trigger
        table.write_migration_logs!(status: "injecting_drop_event_notifier")
        table.inject_notifier_drop_event_trigger
      end

      table.write_migration_logs!(status: "notifiers_created")
    end
  end

  def create_listener_later!
    TableListenerWorker.perform_async(table.id)
  end

  private
  def fetch_table_records!
    if table.is_virtual
      model = Powerbase::Model.new(table)
      @records = model.search({
        offset: offset,
        limit: DEFAULT_PAGE_SIZE,
        sort: [{
          id: "#{order_field.name}-ascending-0",
          field: order_field.name,
          operator: "ascending",
        }],
      })
    else
      sequel_connect(database) do |db|
        table_query = db.from(table.name)
        @total_records = table_query.count
        @records = table_query
          .order(order_field.name.to_sym)
          .limit(DEFAULT_PAGE_SIZE)
          .offset(offset)
          .all
      end
    end
  end

  def set_table_as_migrated
    if !table.is_migrated
      table.write_migration_logs!(status: 'migrated', end_time: Time.now, old_primary_keys: [])
    end
    pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
    pusher_trigger!("table.#{table.id}", "powerbase-data-listener")
  end
end