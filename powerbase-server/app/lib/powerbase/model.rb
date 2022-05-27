include ElasticsearchHelper
include SequelHelper
include FieldTypeHelper

module Powerbase
  class Model
    DEFAULT_PAGE_SIZE = 40

    # * Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(table)
      @table = table.is_a?(ActiveRecord::Base) ? table : PowerbaseTable.find(table)
      @index = @table.index_name
      @table_name = @table.name
      @fields = @table.fields
      @database = @table.db
      @is_turbo = @database.is_turbo || @table.is_virtual
    end

    # Add record for both turbo/non turbo bases.
    def add_record(primary_keys: nil, data: nil)
      data = format_record(data, @fields)
      primary_keys = format_record(primary_keys, @fields, {
        truncate_text: false,
        count_fields: false,
      })

      record = {}
      last_inserted_id = nil
      remote_data = {}
      virtual_data = {}

      data.each do |key, value|
        field = @fields.find {|field| field.name == key.to_s}
        if !field
          raise StandardError.new("Field with name of #{key} could not be found.") if !key.to_s.end_with?("_count")
          field = @fields.find {|field| field.name == key.to_s.chomp("_count")}
          next if !field

          if field.is_virtual && [single_line_text_field.id, long_text_field_type.id].include?(field.powerbase_field_id)
            virtual_data["#{key}_count".to_sym] = value
          end
        else
          if field.is_virtual
            virtual_data[key] = value
          else
            remote_data[key] = value
          end
        end
      end

      if !@table.is_virtual && remote_data.length > 0
        default_value_fields = @fields.find {|field| field.default_value != nil && field.default_value.length > 0}
        incremented_field = @fields.find {|field| field.is_primary_key && field.is_auto_increment}

        query = Powerbase::QueryCompiler.new(@table)

        inserted_record = sequel_connect(@database) do |db|
          table_query = db.from(@table_name.to_sym)
          last_inserted_id = table_query.insert(remote_data)

          # For auto-incremented fields, use last inserted id as primary key if empty
          if last_inserted_id != nil && primary_keys.length == 0
            primary_keys[incremented_field.name.to_sym] = last_inserted_id
          end

          # Query inserted field to get updated record (esp default values fields)
          sequel_query = query.find_by(primary_keys).to_sequel
          table_query.yield_self(&sequel_query).first
        end

        record = { **record, **inserted_record } if inserted_record != nil
      end

      if @is_turbo || (virtual_data.length > 0 && primary_keys.length > 0)
        create_index!(@index)
        virtual_data = @is_turbo ? { **record, **virtual_data } : { **virtual_data, **primary_keys }

        fields = @fields.select {|item| primary_keys.keys.include?(item.name.to_sym) }
        doc_id = get_doc_id(fields, virtual_data, @fields)
        magic_result = update_record(@index, doc_id, virtual_data)

        if magic_result["result"] == "created"
          record = { **virtual_data, doc_id: magic_result["_id"] }
        end
      end

      record
    end

    # Updates data for both turbo/non turbo bases.
    def update_merged_record(primary_keys: nil, data: nil)
      unless primary_keys && data && primary_keys.length > 0 && data.length > 0
        return nil
      end

      remote_data = {}
      virtual_data = {}

      data.each do |key, value|
        field = PowerbaseField.find_by(name: key.to_s, powerbase_table_id: @table.id)

        if !field
          raise StandardError.new("Field with name of #{key} could not be found.") if !key.to_s.end_with?("_count")
          field = PowerbaseField.find_by(name: key.to_s.chomp("_count"), powerbase_table_id: @table.id)
          next if !field

          if field.is_virtual && [single_line_text_field.id, long_text_field_type.id].include?(field.powerbase_field_id)
            virtual_data["#{key}_count".to_sym] = value
          end
        else
          if field.is_virtual
            virtual_data[key] = value
          else
            remote_data[key] = value
          end
        end
      end

      if !@table.is_virtual && remote_data.length > 0
        update_remote_record(primary_keys: primary_keys, data: remote_data)
      end
      update_doc_record(primary_keys: primary_keys, data: virtual_data) if virtual_data.length > 0

      true
    end

    # Updates data in a remote database table record.
    def update_remote_record(primary_keys: nil, data: nil)
      unless primary_keys && data && primary_keys.length > 0 && data.length > 0
        return nil
      end

      data = format_record(data, @fields, { count_fields: false })
      primary_keys = format_record(primary_keys, @fields, {
        truncate_text: false,
        count_fields: false,
      })
      is_turbo = @table.db.is_turbo

      if is_turbo
        doc_size = get_doc_size(data)
        if !is_indexable?(doc_size)
          raise StandardError.new "Failed to update record of size #{doc_size} bytes for '#{@table.alias}'. The record size limit is 100MB"
        end
      end

      query = Powerbase::QueryCompiler.new(@table)
      sequel_query = query.find_by(primary_keys).to_sequel

      record = sequel_connect(@database) {|db|
        db.from(@table_name.to_sym)
          .yield_self(&sequel_query)
          .update(data)
      }

      record = update_doc_record(primary_keys: primary_keys, data: data) if is_turbo
      record
    end

    # Updates data in a document/table record.
    def update_doc_record(primary_keys: nil, data: nil)
      unless primary_keys && data && primary_keys.length > 0 && data.length > 0
        return nil
      end

      data = format_record(data, @fields)
      primary_keys = format_record(primary_keys, @fields, {
        truncate_text: false,
        count_fields: false,
      })

      create_index!(@index) if !@is_turbo
      data = @is_turbo ? data : { **data, **primary_keys }

      doc_size = get_doc_size(data)
      if !is_indexable?(doc_size)
        raise StandardError.new "Failed to update record of size #{doc_size} bytes for '#{@table.alias}'. The record size limit is 80MB"
      end

      result = update_record(@index, primary_keys, data, !@is_turbo)
      { doc_id: result["_id"], result: result["result"], data: data }
    end

    # Delete remote record and es doc.
    def delete_merged_record(primary_keys: nil)
      unless primary_keys && primary_keys.length > 0
        return nil
      end

      result = nil
      magic_fields = @fields.select {|field| field.is_virtual}
      doc_id = format_doc_id(primary_keys)

      if (@is_turbo || magic_fields.length > 0) && doc_id.present?
        begin
          delete_record(@index, doc_id)
          result = true
        rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
          puts "#{Time.now} -- Not found doc_id: #{doc_id}"
        end
      end

      if !@table.is_virtual
        result = nil
        query = Powerbase::QueryCompiler.new(@table)
        sequel_query = query.find_by(primary_keys).to_sequel
        result = sequel_connect(@database) {|db|
          db.from(@table_name.to_sym)
            .yield_self(&sequel_query)
            .delete()
        }
      end

      result
    end

    # * Get a document/table record.
    # Accepts the following options:
    # :id :: the document ID or the SWR key.
    # :primary_keys :: an object of the table's primary keys.
    # :is_remote_record :: whether to get the remote record or not regardless if its turbo or not.
    #    Ex: { pathId: 123, userId: 1245 }
    def get(options)
      include_pii = options[:include_pii]
      include_json = options[:include_json]
      is_remote_record = options[:is_remote_record] || false

      query = Powerbase::QueryCompiler.new(@table, {
        include_pii: include_pii,
        include_json: include_json,
        include_large_text: true,
      })

      if @is_turbo && !is_remote_record
        create_index!(@index)
        search_params = query.find_by(options[:primary_keys]).to_elasticsearch
        result = search_records(@index, search_params)
        raise StandardError.new("Record not found") if result["hits"]["hits"][0] == nil
        format_es_result(result)[0]
      else
        sequel_query = query.find_by(options[:primary_keys]).to_sequel

        record = remote_db() {|db|
          db.from(@table_name)
            .yield_self(&sequel_query)
            .first
        }

        magic_fields = @fields.select {|field| field.is_virtual}
        magic_fields = @table.magic_fields
        if magic_fields.length > 0
          create_index!(@index)
          doc_id = format_doc_id(options[:primary_keys])
          begin
            magic_result = get_record(@index, doc_id)
            { **record, **magic_result["_source"] }
          rescue Elasticsearch::Transport::Transport::Errors::NotFound => exception
            record
          end
        else
          record
        end
      end
    end

    # * Get and sync record for a turbo base.
    # Accepts the following options:
    # :id :: the document ID or the SWR key.
    # :primary_keys :: an object of the table's primary keys.
    #    Ex: { pathId: 123, userId: 1245 }
    def sync_record(options)
      return if !@is_turbo || @table.is_virtual
      indexed_record = get(options)
      remote_record = get({ **options, is_remote_record: true })
      has_synced = false

      # Only get the actual fields for the indexed record.
      doc_id = indexed_record[:doc_id]
      indexed_record = indexed_record.select do |key, value|
        @fields.any? {|item| item.name.to_sym == key && !item.is_virtual}
      end

      if indexed_record != remote_record
        puts "#{Time.now} -- Syncing record with doc_id '#{doc_id}'"
        record = format_record(remote_record, @fields)
        update_record(@index, doc_id, record, !@is_turbo)
        has_synced = true
      end

      { **indexed_record, **remote_record, doc_id: doc_id, has_synced: has_synced }
    end

    # * Get document/table records based on the given columns.
    # :filters :: a JSON that contains the filter for the records.
    #    Ex: { pathId: 123, userId: 1245 }
    # :page :: the page number.
    # :limit :: the page count. No. of records to get per page.
    def where(options)
      page = options[:page] || 1
      limit = options[:limit] || 5
      query = Powerbase::QueryCompiler.new(@table)

      if @is_turbo
        create_index!(@index)
        search_params = query.find_by(options[:filters]).to_elasticsearch
        search_params[:from] = (page - 1) * limit
        search_params[:size] = limit
        result = search_records(@index, search_params)
        format_es_result(result)
      else
        query_string = query.find_by(options[:filters]).to_sequel
        remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query_string)
            .paginate(page, limit)
            .all
        }
      end
    end

    # * Get the filtered and paginated table records.
    # Accepts the following options:
    # :query :: a string that contains the search query for the records.
    # :filter :: a JSON that contains the filter for the records.
    # :sort :: a JSON array that contains the sort for the records.
    # :page :: the page number.
    # :offset :: get records on offset value instead of page number.
    # :limit :: the page count. No. of records to get per page.
    def search(options)
      page = options[:page] || 1
      limit = options[:limit] || @table.page_size
      offset = options[:offset] != nil ? options[:offset] : (page - 1) * limit

      query = Powerbase::QueryCompiler.new(@table, {
        query: options[:query],
        filter: options[:filters],
        sort: options[:sort],
      })
      result = nil

      if @is_turbo
        create_index!(@index)
        search_params = query.to_elasticsearch
        search_params[:from] = offset
        search_params[:size] = limit
        result = search_records(@index, search_params)
        result = format_es_result(result)
      else
        magic_search_params = query.to_elasticsearch
        magic_records = nil

        if magic_search_params != nil
          create_index!(@index)
          magic_search_params[:from] = offset
          magic_search_params[:size] = limit + 100
          magic_result = search_records(@index, magic_search_params)
          magic_records = format_es_result(magic_result)
        end

        records = remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query.to_sequel)
            .paginate(page, limit)
            .all
        }

        result = query.merge_records(records, magic_records)
      end

      doc_size = get_doc_size(result)
      raise StandardError.new("Could not query data of #{doc_size} bytes. Payload is too large. Limit is 80MB.") if !is_indexable?(doc_size)

      result
    end

    # * Get total table records.
    # Accepts the following options:
    # :query :: a string that contains the search query for the records.
    # :filter :: a JSON that contains the filter for the records.
    def get_count(options = {})
      query = Powerbase::QueryCompiler.new(@table, {
        query: options[:query],
        sort: false,
        filter: options[:filters],
      })

      if @is_turbo
        create_index!(@index)
        search_params = query.to_elasticsearch.except(:_source, :script_fields)
        response = get_records_count(@index, search_params)
        response["count"]
      else
        remote_db() {|db|
          db.from(@table_name)
            .yield_self(&query.to_sequel)
            .count
        }
      end
    end

    private
      def remote_db
        sequel_connect(@database) do |db|
          yield(db) if block_given?
        end
      end

      def sanitize(string)
        string.gsub(/['"]/,'')
      end
  end
end