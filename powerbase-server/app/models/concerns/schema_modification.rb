module SchemaModification
  include SequelHelper
  extend ActiveSupport::Concern

  def update_primary_keys(primary_keys = [])
    constraints = self.db.connections
      .filter {|connection| connection.referenced_table_id == self.id && connection.is_constraint}

    if constraints.length > 0
      raise StandardError.new "Cannot update primary key because it is needed in a foreign key constraint. Remove referenced foreign key constraint first to update this table's primary key."
    end

    fields = self.fields

    pii_fields = fields.select {|field| field.is_pii }
    if pii_fields.any?
      raise StandardError.new "Cannot set a PII field as a primary key. To proceed, please unset the selected field as PII first."
    end

    table_name = self.name.to_sym
    primary_keys = Array(primary_keys)
    primary_keys = fields
      .select {|field| primary_keys.include?(field.name)}
      .map {|field| field.name.to_sym}
    current_primary_keys = fields
      .select {|field| field.is_primary_key}
      .map {|field| field.name.to_sym}

    return if primary_keys.sort == current_primary_keys.sort

    is_postgresql = self.db.postgresql?
    indexes = if is_postgresql
        _sequel.fetch("
          SELECT ix.relname as index_name,
            upper(am.amname) AS index_algorithm,
            indisunique as is_unique,
            pg_get_indexdef(indexrelid) as index_definition
          FROM pg_index i
          JOIN pg_class t ON t.oid = i.indrelid
          JOIN pg_class ix ON ix.oid = i.indexrelid
          JOIN pg_namespace n ON t.relnamespace = n.oid
          JOIN pg_am as am ON ix.relam = am.oid
          WHERE t.relname = '#{self.name}' AND n.nspname = 'public';
        ").all
      else
        _sequel.fetch("
          SELECT index_name as index_name,
            index_type AS index_algorithm,
            CASE non_unique
              WHEN 0 THEN 'TRUE'
              ELSE 'FALSE'
            END AS is_unique,
            column_name as column_name
          FROM information_schema.statistics
          WHERE table_schema='#{self.db.database_name}' AND table_name='#{self.name}' ORDER BY seq_in_index ASC;
        ").all
      end

    key_query = is_postgresql ? "pk" : "primary"
    primary_key_index = indexes.select {|index| index[:index_name].downcase.include?(key_query) && index[:is_unique]}.first

    if primary_key_index
      _sequel.alter_table(table_name) do
        drop_constraint(primary_key_index[:index_name], type: :primary_key)
      end
    end

    if primary_keys.length > 0
      _sequel.alter_table(table_name) do
        add_primary_key(primary_keys)
      end
    end

    self._sequel.disconnect

    fields.each do |field|
      is_primary_key = primary_keys.include?(field.name.to_sym)

      if field.is_primary_key != is_primary_key
        field.update(is_primary_key: is_primary_key)
      end
    end
  end
end