include SequelHelper

class Tables::Syncer
  attr_accessor :table, :schema, :fields, :new_conn

  def initialize(table, schema, new_conn = false)
    @new_conn = new_conn
    @table = table
    @fields = @table.fields.reload.select {|field| !field.is_virtual}

    begin
      @schema = schema || sequel_connect(@table.db) {|db| db.schema(@table.name.to_sym)}
    rescue Sequel::Error => ex
      if ex.message.include?("schema parsing returned no columns")
        @schema = []
      else
        raise ex
      end
    end
  end

  def sync!
    added_columns = schema.map(&:first) - fields.map{|field| field.name.to_sym}
    dropped_columns = (fields.map{|field| field.name.to_sym} - schema.map(&:first)).map(&:to_s)

    if added_columns.count > 0
      puts "#{Time.now} -- Migrating #{added_columns.count} added columns"

      columns = schema.select{|col| added_columns.include? col.first}
      columns.each do |column|
        field = Fields::Creator.new column, table
        field.save
      end
    end

    if dropped_columns.count > 0
      puts "#{Time.now} -- Migrating #{dropped_columns.count} dropped columns"
      powerbase_fields = fields.select{|field| dropped_columns.include?(field.name)}
      powerbase_fields.each do |field|
        field.destroy
      end
    end

    if added_columns.count > 0 || dropped_columns.count > 0
      table.migrator.create_base_connection!
      set_table_as_migrated

      puts "#{Time.now} -- Reindexing table##{table.id}"
      table.reindex_later!
    end
  end

  private
    def set_table_as_migrated
      if new_conn && !database.is_turbo
        unmigrated_columns = Array(table.logs["migration"]["unmigrated_columns"])

        if unmigrated_columns.empty?
          table.write_migration_logs!(status: "migrated")
          pusher_trigger!("table.#{table.id}", "table-migration-listener", { id: table.id })
        end
      end
    end
end