include SequelHelper
include PusherHelper
include ElasticsearchHelper

class Tables::Syncer
  attr_accessor :database, :table, :schema, :foreign_keys, :new_connection, :reindex, :new_table,
                :fields, :primary_keys, :connections, :primary_keys_fields, :unmigrated_columns, :dropped_columns,
                :is_records_synced, :has_primary_key_changed, :has_foreign_key_changed, :is_turbo


  # Accepts the ff options:
  # - schema :: symbol array - array of column names for the given table.
  # - foreign_keys :: object array - array of foreign keys of the given table.
  # - new_connection :: boolean - if the table syncer is called during a newly migrated database or not.
  # - reindex :: boolean - if the table should reindex after migration.
  # - new_table :: boolean - if the table is newly createdl.
  def initialize(table, schema: nil, foreign_keys: nil, new_connection: false, reindex: true, new_table: false)
    @table = table
    @database = table.db
    @new_connection = new_connection
    @reindex = reindex
    @new_table = new_table

    @fields = @table.fields.reload.select {|field| !field.is_virtual}
    @primary_keys_fields = @fields.select{|field| field.is_primary_key}
      .map{|field| field.name.to_sym}
    @connections = @table.connections
    @is_turbo = @database.is_turbo
    @is_records_synced = new_table ? false : @table.migrator.in_synced?

    begin
      @schema = schema || sequel_connect(@database) {|db| db.schema(@table.name.to_sym)}
    rescue Sequel::Error => ex
      if ex.message.include?("schema parsing returned no columns")
        @schema = []
      else
        raise ex
      end
    end

    @foreign_keys = foreign_keys || sequel_connect(@database) {|db| db.foreign_key_list(@table.name) }
    @primary_keys =  @schema.select{|name, options| options[:primary_key]}.map(&:first)
    @unmigrated_columns = @schema.map(&:first) - fields.map{|field| field.name.to_sym}
    @dropped_columns = fields.map{|field| field.name.to_sym} - @schema.map(&:first)
  end

  def has_primary_key_changed?
    @has_primary_key_changed ||= @primary_keys != @primary_keys_fields
  end

  def has_foreign_key_changed?
    @has_foreign_key_changed ||= @foreign_keys.any? do |fkey|
      !@connections.any?{|conn| conn.columns.map(&:to_sym) == fkey[:columns] && conn.referenced_columns.map(&:to_sym) == fkey[:key] }
    end
  end

  def in_synced?
    set_table_as_migrated(true)
    !new_connection && unmigrated_columns.empty? && dropped_columns.empty? &&
      is_records_synced &&
      !has_primary_key_changed? &&
      !has_foreign_key_changed?
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

    if !new_connection
      if has_primary_key_changed
        puts "#{Time.now} -- Migrating changed primary key(s)"
        # Record old primary keys for reindexing to know the old doc_id
        table.write_migration_logs!(old_primary_keys: primary_keys_fields)

        # Update primary key fields
        fields.each do |field|
          is_primary_key = primary_keys.include?(field.name.to_sym)

          if field.is_primary_key != is_primary_key
            field.update(is_primary_key: is_primary_key)
          end
        end
      end

      if has_foreign_key_changed
        puts "#{Time.now} -- Migrating changed foreign key(s)"
        # TODO: Migrate changed foreign keys
        # 1. Remove constraint connections that are not found on the foreign key list from remote db.
        # 2. Migrate found foreign key list from remote db.
        # -> call create_base_connection!
      end

      if unmigrated_columns.count > 0
        table.migrator.create_base_connection!
      end
    end

    set_table_as_migrated

    table.migrator.create_listener! if new_table
    return if new_connection

    has_virtual_fields = fields.any?{|field| field.is_virtual}

    if !is_records_synced || reindex || (!is_turbo && has_virtual_fields && has_primary_key_changed)
      puts "#{Time.now} -- Reindexing table##{table.id}"
      table.reindex_later!
    else
      set_table_as_migrated(true)
    end

    pusher_trigger!("table.#{table.id}", "powerbase-data-listener", { id: table.id })
  end

  private
    def set_table_as_migrated(should_set = false)
      if (should_set && !table.is_migrated) || (new_connection && !is_turbo)
        table.write_migration_logs!(status: "migrated")
      end
    end
end