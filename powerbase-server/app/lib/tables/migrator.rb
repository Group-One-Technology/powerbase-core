class Tables::Migrator
  include ElasticsearchHelper
  include SequelHelper
  include FieldTypeHelper
  include PusherHelper

  attr_accessor :table, :index_name, :primary_keys,
                :order_field, :adapter, :fields, :offset,
                :indexed_records, :total_records, :records,
                :database, :has_row_oid_support

  def initialize(table)
    @table = table
    @index_name = table.index_name
    @fields = table.fields.reload
    @primary_keys = table.primary_keys
    @order_field = primary_keys.first || fields.first
    @adapter = table.db.adapter
    @database = table.db
    @has_row_oid_support = database.has_row_oid_support?
    @offset = table.logs["migration"]["offset"] || 0
    @indexed_records = table.logs["migration"]["indexed_records"] || 0
  end

  def index!
    create_index!(index_name)
    @total_records = sequel_connect(database) {|db| db.from(table.name).count}
    table.write_migration_logs!(total_records: total_records)
    actual_fields = fields.select {|field| !field.is_virtual}
    old_primary_keys = Array(table.logs["migration"]["old_primary_keys"])

    # Reset all migration counter logs when first time indexing or when re-indexing.
    if table.logs["migration"]["start_time"] == nil || table.status == "migrated"
      @offset = 0
      @indexed_records = 0
      table.write_migration_logs!(
        indexed_records: 0,
        offset: 0,
        start_time: Time.now,
      )
    end

    table.write_migration_logs!(status: "indexing_records")

    if total_records.zero?
      puts "No record found"
      set_table_as_migrated
      return
    end

    puts "#{Time.now} Saving #{total_records} documents at index #{index_name}..."

    while offset < total_records
      fetch_table_records!

      records.each do |record|
        begin
          # Format doc based on record field types
          doc = {}
          record.collect {|key, value| key }.each do |key|
            cur_field = fields.find {|field| field.name.to_sym == key }

            if cur_field
              doc[key] = case cur_field.powerbase_field_type_id
                when number_field_type.id
                  record[key]
                when date_field_type.id
                  date = DateTime.parse(record[key]) rescue nil
                  if date != nil
                    date.utc.strftime("%FT%T.%L%z")
                  else
                    record[key]
                  end
                else
                  %Q(#{record[key]})
                end
            end
          end

          doc_id = get_doc_id(primary_keys, doc, actual_fields)
          puts "--- DOC_ID: #{doc_id}"
          doc = doc.slice!(:oid)

          if doc_id.present?
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
                query = Powerbase::QueryCompiler.new(@table, {
                  include_pii: true,
                  include_json: true,
                })
                search_params = query.find_by(primary_key_fields).to_elasticsearch
                es_result = search_records(index_name, search_params)
                old_doc = format_es_result(es_result)
                if old_doc.length > 0
                  old_doc_id = old_doc[0][:doc_id]
                  old_doc = old_doc[0].slice!(:doc_id)
                end
              end
            else
              # Check if there's an existing doc with no primary keys
              search_doc_id = get_doc_id([], doc, actual_fields)
              begin
                old_doc = get_record(index_name, search_doc_id)

                if old_doc != nil && old_doc.key?("_source")
                  old_doc = old_doc["_source"]
                  old_doc_id = search_doc_id
                end
              rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
                puts "No old document found for doc_id of #{doc_id}"
              end
            end

            # Remove the old existing doc
            if old_doc_id != nil && old_doc_id != doc_id
              begin
                delete_record(index_name, old_doc_id)
                puts "Deleted old document with doc_id of '#{old_doc_id}'"
              rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
                puts "No old document found for doc_id of #{doc_id}"
              end
            end

            # Merge Actual and Magic Records (if any)
            if old_doc != nil && old_doc.length > 0
              doc = { **old_doc, **doc }
            end

            # Upsert formatted doc
            update_record(index_name, doc_id, doc)
            @indexed_records += 1
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
              error: "Failed to index record in table with id of #{table.id}",
              exception: exception,
            }
          )
        end
      end

      @offset += DEFAULT_PAGE_SIZE

      table.write_migration_logs!(offset: offset, indexed_records: indexed_records)
      pusher_trigger!("table.#{table.id}", "notifier-migration-listener", {
        id: table.id,
        offset: offset,
        indexed_records: indexed_records,
      })
    end

    create_listener!
    set_table_as_migrated
  end

  def create_base_connection!
    puts "Adding and auto linking connections of table##{table.id}"
    table.write_migration_logs!(status: "adding_connections")

    table_foreign_keys = sequel_connect(database) {|db| db.foreign_key_list(table.name) }
    table_foreign_keys.each do |foreign_key|
      referenced_table = database.tables.find_by(name: foreign_key[:table].to_s)

      if referenced_table
        base_connection = BaseConnection.find_by(
          name: foreign_key[:name],
          powerbase_table_id: table.id,
          powerbase_database_id: table.powerbase_database_id,
        ) || BaseConnection.new
        base_connection.name = foreign_key[:name]
        base_connection.columns = foreign_key[:columns]
        base_connection.referenced_columns = foreign_key[:key]
        base_connection.referenced_table_id = referenced_table.id
        base_connection.referenced_database_id = referenced_table.powerbase_database_id
        base_connection.powerbase_table_id = table.id
        base_connection.powerbase_database_id = table.powerbase_database_id
        base_connection.is_constraint = true

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

    table.write_migration_logs!(status: "migrated_connections")
    pusher_trigger!("table.#{table.id}", "connection-migration-listener", { id: table.id })
    pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
  end

  def create_base_connection_later!
    TableConnectionsWorker.perform_async(table.id)
  end

  def create_listener!
    if database.postgresql? && ENV["ENABLE_LISTENER"] == "true"
      if database.has_row_oid_support?
        table.write_migration_logs!(status: "injecting_oid")
        table.inject_oid
      end

      table.write_migration_logs!(status: "injecting_notifier")
      table.inject_notifier_trigger
      table.write_migration_logs!(status: "notifiers_created")
    end
  end

  def create_listener_later!
    TableConnectionsWorker.perform_async(table.id)
  end

  private
  def fetch_table_records!
    sequel_connect(database) do |db|
      @total_records = db.from(table.name).count
      table_query = db.from(table.name)
      @records = table_query.select(*default_table_select(adapter.to_sym, has_row_oid_support))
        .order(order_field.name.to_sym)
        .limit(DEFAULT_PAGE_SIZE)
        .offset(offset)
        .all
    end
  end

  def set_table_as_migrated
    table.write_migration_logs!(status: 'migrated', end_time: Time.now, old_primary_keys: [])
    pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
    pusher_trigger!("table.#{table.id}", "powerbase-data-listener")
  end
end