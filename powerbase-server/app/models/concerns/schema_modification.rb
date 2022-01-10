module SchemaModification
  include SequelHelper
  extend ActiveSupport::Concern

  def update_primary_keys(primary_keys = [])
    fields = self.fields
    table_name = self.name.to_sym
    primary_keys = Array(primary_keys)
    primary_keys = fields
      .select {|field| primary_keys.include?(field.name)}
      .map {|field| field.name.to_sym}
    current_primary_keys = fields
      .select {|field| field.is_primary_key}
      .map {|field| field.name.to_sym}

    return if primary_keys.sort == current_primary_keys.sort

    if primary_keys.length > 0
      indexes = if self.db.postgresql?
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
          []
        end

      primary_key_index = indexes.select {|index| index[:index_name].include?("pk") && index[:is_unique]}.first

      if primary_key_index
        _sequel.alter_table(table_name) do
          drop_constraint(primary_key_index[:index_name])
          add_primary_key(primary_keys)
        end
      else
        _sequel.alter_table(table_name) do
          add_primary_key primary_keys
        end
      end

      self._sequel.disconnect
    end

    fields.each do |field|
      is_primary_key = primary_keys.include?(field.name.to_sym)

      if field.is_primary_key != is_primary_key
        field.update(is_primary_key: is_primary_key)
      end
    end
  end
end