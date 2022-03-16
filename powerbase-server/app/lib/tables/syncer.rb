include SequelHelper
include PusherHelper
include ElasticsearchHelper

class Tables::Syncer
  attr_accessor :table, :fields, :unmigrated_columns, :dropped_columns, :is_records_synced,
                :schema, :new_connection, :reindex, :new_table

  # Accepts the ff options:
  # - schema :: symbol array - array of column names for the given table.
  # - new_connection :: boolean - if the table syncer is called during a newly migrated database or not.
  # - reindex :: boolean - if the table should reindex after migration.
  # - new_table :: boolean - if the table is newly createdl.
  def initialize(table, schema: nil, new_connection: false, reindex: true, new_table: false)
    @table = table
    @new_connection = new_connection
    @reindex = reindex
    @new_table = new_table
    @fields = @table.fields.reload.select {|field| !field.is_virtual}
    @is_records_synced = new_table ? false : @table.migrator.in_synced?

    begin
      @schema = schema || sequel_connect(@table.db) {|db| db.schema(@table.name.to_sym)}
    rescue Sequel::Error => ex
      if ex.message.include?("schema parsing returned no columns")
        @schema = []
      else
        raise ex
      end
    end

    @unmigrated_columns = @schema.map(&:first) - fields.map{|field| field.name.to_sym}
    @dropped_columns = fields.map{|field| field.name.to_sym} - @schema.map(&:first)
  end

  def in_synced?
    set_table_as_migrated(true)
    unmigrated_columns.empty? && dropped_columns.empty? && is_records_synced
  end

  def sync!
    if in_synced?
      puts "#{Time.now} -- Table##{table.id} is already in synced."
      return
    end

    if unmigrated_columns.count > 0
      puts "#{Time.now} -- Migrating #{unmigrated_columns.count} unmigrated columns"
      table.write_migration_logs!(status: "migrating_metadata", unmigrated_columns: unmigrated_columns)

      columns = schema.select{|col| unmigrated_columns.include? col.first}
      columns.each do |column|
        field = Fields::Creator.new column, table
        field.save
      end
    end

    if dropped_columns.count > 0
      puts "#{Time.now} -- Migrating #{dropped_columns.count} dropped columns"
      index_name = table.index_name
      powerbase_fields = fields.select{|field| dropped_columns.include?(field.name.to_sym)}
      powerbase_fields.each do |field|
        field_name = field.name
        field.destroy

        # Remove field for every doc under index_name in elasticsearch
        remove_column(index_name, field_name)
      end
    end

    if !new_connection && unmigrated_columns.count > 0
      table.migrator.create_base_connection!
    end

    set_table_as_migrated

    table.migrator.create_listener! if new_table
    return if new_connection

    if !is_records_synced || reindex
      puts "#{Time.now} -- Reindexing table##{table.id}"
      table.reindex_later!
    else
      set_table_as_migrated(true)
    end
  end

  private
    def set_table_as_migrated(should_set = false)
      if (should_set && !table.is_migrated) || (new_connection && !table.db.is_turbo)
        table.write_migration_logs!(status: "migrated")
        pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
      end
    end
end