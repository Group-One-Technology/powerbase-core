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
    @offset = 0
    @indexed_records = 0
  end

  def index!
    write_table_migration_logs!(status: "indexing_records")
    pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)

    create_index!(index_name)

    @total_records = sequel_connect(database) {|db| db.from(table.name).count}

    # Reset all migration counter logs
    write_table_migration_logs!(total_records: total_records, indexed_records: 0, offset: 0, start_time: Time.now)

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
          oid = record.try(:[], :oid)
          doc_id = has_row_oid_support ? "oid_#{oid}" : get_doc_id(primary_keys, record, fields)
          puts "--- DOC_ID: #{doc_id}"
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

          doc = doc.slice!(:oid)

          if doc_id.present?
            update_record(index_name, doc_id, doc)
            @indexed_records += 1
          else
            write_table_migration_logs!(
              error: {
                type: "Elasticsearch",
                error: "Failed to generate doc_id for record in table with id of #{table.id}",
                record: record,
              }
            )
          end
        rescue => exception
          write_table_migration_logs!(
            error: {
              type: "Elasticsearch",
              error: "Failed to index record in table with id of #{table.id}",
              exception: exception,
            }
          )
        end
      end

      @offset += DEFAULT_PAGE_SIZE

      write_table_migration_logs!(offset: offset, indexed_records: indexed_records)
      pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)
    end

    set_table_as_migrated
  end

  def create_base_connection!
    puts "Adding and auto linking connections of table##{table.id}"

    table.logs["migration"]["status"] = "adding_connections"
    table.save

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

    table.logs["migration"]["status"] = "migrated_connections"
    table.save

    pusher_trigger!("table.#{table.id}", "connection-migration-listener", table)
    pusher_trigger!("table.#{table.id}", "table-migration-listener", table)
  end

  def create_base_connection_later!
    TableConnectionsWorker.perform_async(table.id)
  end

  def create_listener!
    if database.postgresql? && ENV["ENABLE_LISTENER"] == "true"
      if database.has_row_oid_support?
        table.logs["migration"]["status"] = "injecting_oid"
        table.save
        pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)

        table.inject_oid
      end

      table.logs["migration"]["status"] = "injecting_notifier"
      table.save
      pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)

      table.inject_notifier_trigger

      table.logs["migration"]["status"] = "notifiers_created"
      table.save
      pusher_trigger!("table.#{table.id}", "notifier-migration-listener", table)
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
    write_table_migration_logs!(status: 'migrated', end_time: Time.now)

    table.is_migrated = true
    table.save

    pusher_trigger!("table.#{table.id}", "table-migration-listener", table)
    pusher_trigger!("table.#{table.id}", "powerbase-data-listener")
  end

  def write_table_migration_logs!(status: nil, total_records: nil, offset: nil, indexed_records: nil, start_time: nil, end_time: nil, error: nil)
    table.logs["migration"]["status"] = status if status.present?
    table.logs["migration"]["total_records"] = total_records if total_records.present?
    table.logs["migration"]["offset"] = offset if offset.present?
    table.logs["migration"]["indexed_records"] = indexed_records if indexed_records.present?
    table.logs["migration"]["start_time"] = start_time if start_time.present?
    table.logs["migration"]["end_time"] = end_time if end_time.present?
    table.logs["migration"]["errors"] << error if error.present?
    table.save
  end
end