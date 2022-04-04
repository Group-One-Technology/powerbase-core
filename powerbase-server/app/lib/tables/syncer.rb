include SequelHelper
include PusherHelper
include ElasticsearchHelper

class Tables::Syncer
  attr_accessor :database, :table, :schema, :foreign_keys, :new_connection, :reindex, :new_table,
                :fields, :primary_keys, :connections, :primary_keys_fields, :unmigrated_columns, :dropped_columns, :updated_columns,
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
    @connections = @table.connections.select {|conn| conn.is_constraint}
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
    @updated_columns = fields.select do |field|
      column = @schema.find {|col_name, col_options| col_name == field.name.to_sym}
      return false if !column
      col_name, col_options = column

      # Check if field options changed
      col_options[:oid] != field.oid || col_options[:db_type] != field.db_type ||
        col_options[:allow_null] != field.is_nullable ||
        (col_options[:default] || nil) != field.default_value ||
        (col_options[:auto_increment] || false) != field.is_auto_increment
    end
  end

  def has_primary_key_changed?
    @has_primary_key_changed ||= @primary_keys != @primary_keys_fields
  end

  def has_foreign_key_changed?
    @has_foreign_key_changed ||= @foreign_keys.count != @connections.count || @foreign_keys.any? do |fkey|
      !@connections.any?{|conn| conn.columns.map(&:to_sym) == fkey[:columns] && conn.referenced_columns.map(&:to_sym) == fkey[:key] }
    end
  end

  def in_synced?
    set_table_as_migrated(true)
    !new_connection && unmigrated_columns.empty? && dropped_columns.empty? && updated_columns.empty? &&
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
      powerbase_fields.each {|field| field.drop(false)}
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
        unmigrated_fkeys = foreign_keys.select do |fkey|
          !connections.any?{|conn| conn.columns.map(&:to_sym) == fkey[:columns] && conn.referenced_columns.map(&:to_sym) == fkey[:key]}
        end
        deleted_connections = connections.select do |conn|
          !foreign_keys.any?{|fkey| conn.columns.map(&:to_sym) == fkey[:columns] && conn.referenced_columns.map(&:to_sym) == fkey[:key]}
        end

        if unmigrated_fkeys.count > 0
          puts "#{Time.now} -- Migrating #{unmigrated_fkeys.count} unmigrated foreign key(s)"
          tables = database.tables

          unmigrated_fkeys.each do |foreign_key|
            referenced_table = tables.find_by(name: foreign_key[:table].to_s)

            if referenced_table
              conn_creator = BaseConnection::Creator.new table, {
                name: foreign_key[:name],
                columns:  foreign_key[:columns],
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

        if deleted_connections.count > 0
          puts "#{Time.now} -- Migrating #{deleted_connections.count} deleted foreign key(s)"
          deleted_connections.map(&:destroy)
        end
      end

      if updated_columns.count > 0
        puts "#{Time.now} -- Migrating #{updated_columns.count} updated columns"
        updated_columns.each do |field|
          column = schema.find {|col_name, col_options| col_name == field.name.to_sym}
          next if !column
          col_name, col_options = column

          # Update field based on retrieved schema
          if col_options[:db_type] != field.db_type
            column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
              .where("? ILIKE CONCAT('%', db_type, '%')", "%#{col_options[:db_type]}%")
              .take

            single_line_text_field = PowerbaseFieldType.find_by(name: "Single Line Text")
            field_type = PowerbaseFieldType.find_by(
              name: column_type ? column_type.powerbase_field_type.name : "Others"
            )

            field.db_type = col_options[:db_type]
            field.powerbase_field_type_id = field_type.id || single_line_text_field.id
          end

          field.oid = col_options[:oid]
          field.default_value = col_options[:default] || nil
          field.is_nullable = col_options[:allow_null]
          field.is_auto_increment = col_options[:auto_increment] || false
          field.save
        end
      end

      if unmigrated_columns.count > 0
        table.migrator.create_base_connection!(foreign_keys)
      end
    end

    set_table_as_migrated

    table.migrator.create_listener! if new_table
    return if new_connection

    has_virtual_fields = fields.any?{|field| field.is_virtual}
    should_reindex = !is_records_synced ||
      !unmigrated_columns.empty? ||
      !updated_columns.empty? ||
      ((is_turbo && has_primary_key_changed) || (!is_turbo && has_virtual_fields && has_primary_key_changed))

    if reindex && should_reindex
      puts "#{Time.now} -- Reindexing table##{table.id}"
      table.reindex_later!
    else
      set_table_as_migrated(true)
    end

    if !updated_columns.empty? || has_foreign_key_changed || ((is_turbo && has_primary_key_changed) || (!is_turbo && has_virtual_fields && has_primary_key_changed))
      pusher_trigger!("table.#{table.id}", "connection-migration-listener", { id: table.id })
    else
      pusher_trigger!("table.#{table.id}", "powerbase-data-listener", { id: table.id })
    end
  end

  private
    def set_table_as_migrated(should_set = false)
      if (should_set && !table.is_migrated) || (new_connection && !is_turbo)
        table.write_migration_logs!(status: "migrated")
      end
    end
end