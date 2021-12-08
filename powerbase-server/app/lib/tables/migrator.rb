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
    create_index!(index_name)

    @total_records = sequel_connect(database) {|db| db.from(table.name).count}

    if total_records.zero?
        puts "No record found"
        return
    end

    # Reset all migration counter logs
    write_table_migration_logs!(total_records: total_records, indexed_records: 0, offset: 0, start_time: Time.now)
    puts "#{Time.now} Saving #{total_records} documents at index #{index_name}..."
    while offset < total_records
      fetch_table_records!

      records.each do |record|
        oid = record.try(:[], :oid)
        doc_id = has_row_oid_support ? "oid_#{record[:oid]}" : get_doc_id(primary_keys, record, fields, adapter)
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
      end

      @offset += DEFAULT_PAGE_SIZE
      write_table_migration_logs!(offset: offset, indexed_records: indexed_records, end_time: Time.now)
    end

    table.is_migrated = true
    table.save

    pusher_trigger!("table.#{table.id}", "table-migration-listener", table)
    pusher_trigger!("table.#{table.id}", "powerbase-data-listener")

    if database.is_migrating?
      database.is_migrated = true
      database.save
      database.base_migration.end_time = Time.now
      database.base_migration.save

      pusher_trigger!("database.#{database.id}", "migration-listener", database)
    end
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

  def write_table_migration_logs!(total_records: nil, offset: nil, indexed_records: nil, start_time: nil, end_time: nil, error: nil)
    table.logs["migration"]["total_records"] = total_records if total_records.present?
    table.logs["migration"]["offset"] = offset if offset.present?
    table.logs["migration"]["indexed_records"] = indexed_records if indexed_records.present?
    table.logs["migration"]["start_time"] = start_time if start_time.present?
    table.logs["migration"]["end_time"] = end_time if end_time.present?
    table.logs["migration"]["errors"] << error if error.present?
    table.save
  end
end