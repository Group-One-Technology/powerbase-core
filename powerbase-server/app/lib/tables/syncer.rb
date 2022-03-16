include SequelHelper
include PusherHelper

class Tables::Syncer
  attr_accessor :table, :fields, :unmigrated_columns, :dropped_columns, :is_records_synced,
                :schema, :new_connection, :reindex

  # Accepts the ff options:
  # - schema :: symbol array - array of column names for the given table.
  # - new_connection :: boolean - if the table syncer is called during a newly migrated database or not.
  # - reindex :: boolean - if the table should reindex after migration
  def initialize(table, schema: nil, new_connection: false, reindex: true)
    @table = table
    @new_connection = new_connection
    @reindex = reindex
    @fields = @table.fields.reload.select {|field| !field.is_virtual}
    @is_records_synced = @table.migrator.in_synced?

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
      powerbase_fields = fields.select{|field| dropped_columns.include?(field.name.to_sym)}
      powerbase_fields.each do |field|
        field.destroy
      end
    end

    table.migrator.create_base_connection! if !new_connection
    set_table_as_migrated

    return if new_connection

    if !is_records_synced || reindex
      puts "#{Time.now} -- Reindexing table##{table.id}"
      table.reindex_later!
    end
  end

  private
    def set_table_as_migrated
      if new_connection && !table.db.is_turbo
        table.write_migration_logs!(status: "migrated")
        pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
      end
    end
end