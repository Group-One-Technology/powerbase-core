module Powerbase
  ELASTICSEACH_ID_LIMIT = 512
  DEFAULT_PAGE_SIZE = 40

  class Model
    # * Initialize the Powerbase::Model
    # Either connects to Elasticsearch or the remote database based on the "is_turbo" flag.
    def initialize(esclient, table_id)
      @table_id = table_id
      @esclient = esclient

      @powerbase_table = PowerbaseTable.find(table_id)
      @powerbase_database = PowerbaseDatabase.find(@powerbase_table.powerbase_database_id)
      @table_name = @powerbase_table.name
      @is_turbo = @powerbase_database.is_turbo
    end

    # * Save multiple documents of a table to Elasticsearch.
    def index_records
      index = "table_records_#{@table_id}"
      fields = PowerbaseField.where(powerbase_table_id: @table_id)
      primary_keys = fields.select {|field| field.is_primary_key }
      number_field_type = PowerbaseFieldType.find_by(name: "Number")
      date_field_type = PowerbaseFieldType.find_by(name: "Date")

      if !@esclient.indices.exists(index: index)
        @esclient.indices.create(
          index: index,
          body: {
            settings: { "index.mapping.ignore_malformed": true },
          }
        )
      end

      records = remote_db() {|db|
        table = db.from(@table_name)
        total_records = table.count

        puts "#{Time.now} Saving #{total_records} documents at index #{index}..."

        table_select = [Sequel.lit("*")]

        if @powerbase_database.adapter == "postgresql"
          table_select.push(Sequel.lit("ctid"))
        end

        table.select(*table_select).paged_each(:rows_per_fetch => DEFAULT_PAGE_SIZE) {|record|
          doc_id = if primary_keys.length > 0
              primary_keys
                .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
                .join("-")
            elsif @powerbase_database.adapter == "postgresql"
              "ctid_#{record[:ctid]}"
            else
              field_ids = fields.select {|field|
                field.name.downcase.include?("id") || field.name.downcase.include?("identifier")
              }

              if field_ids.length > 0
                field_ids
                  .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
                  .join("-")
              else
                not_nullable_fields = fields.select {|field| !field.is_nullable }

                if not_nullable_fields.length > 0
                  not_nullable_fields
                    .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
                    .join("-")
                else
                  fields
                    .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
                    .join("-")
                end
              end
            end

          doc = {}
          record_keys = record.collect {|key, value| key }
          record_keys.map do |key|
            cur_field = fields.find {|field| field.name.to_sym == key }

            if cur_field
              doc[key] = case cur_field.powerbase_field_type_id
                when number_field_type.id
                  record[key]
                when date_field_type.id
                  date = DateTime.parse(record[key]) rescue nil
                  if date
                    date.strftime("%FT%T.%L%z")
                  else
                    record[key]
                  end
                else
                  %Q(#{record[key]})
                end
            end
          end
          doc = doc.slice!(:ctid)

          if doc_id != nil
            @esclient.update(
              index: index,
              id: format_doc_id(doc_id),
              body: {
                doc: doc,
                doc_as_upsert: true
              }
            )
          else
            puts "Failed to generate #{doc_id} for record in table with id of #{@table_id}"
            puts record
          end
        }
      }
    end

    # * Get a document/table record.
    # Accepts the following options:
    # :id :: the document ID or the SWR key.
    # :primary_keys :: an object of the table's primary keys.
    #    Ex: { pathId: 123, userId: 1245 }
    def get(options)
      index = "table_records_#{@table_id}"

      if @is_turbo
        id = options[:id] || options[:primary_keys]
          .each_key {|key| "#{sanitize(key)}_#{sanitize(options[:primary_keys][key])}" }
          .join("-")

        @esclient.get(index: index, id: format_doc_id(id))["_source"]
      else
        query = Powerbase::QueryCompiler.new(nil, @powerbase_database.adapter)
        query_string = query.find_by(options[:primary_keys]).to_sequel

        remote_db() {|db|
          db.from(@table_name)
            .where(eval(query_string))
            .first
        }
      end
    end

    # * Get document/table records based on the given columns.
    # :filters :: a JSON that contains the filter for the records.
    #    Ex: { pathId: 123, userId: 1245 }
    # :page :: the page number.
    # :limit :: the page count. No. of records to get per page.
    def where(options)
      index = "table_records_#{@table_id}"
      page = options[:page] || 1
      limit = options[:limit] || 5

      if @is_turbo
        query = Powerbase::QueryCompiler.new(nil, @powerbase_database.adapter)
        query_string = query.find_by(options[:filters]).to_elasticsearch

        result = @esclient.search(
          index: index,
          body: {
            from: (page - 1) * limit,
            size: limit,
            query: {
              query_string: { query: query_string },
            },
          },
        )

        result["hits"]["hits"].map {|result| result["_source"]}
      else
        query = Powerbase::QueryCompiler.new(nil, @powerbase_database.adapter)
        query_string = query.find_by(options[:filters]).to_sequel

        remote_db() {|db|
          db.from(@table_name)
            .where(eval(query_string))
            .paginate(page, limit)
            .all
        }
      end
    end

    # * Get the filtered and paginated table records.
    # Accepts the following options:
    # :filter :: a JSON that contains the filter for the records.
    # :page :: the page number.
    # :limit :: the page count. No. of records to get per page.
    def search(options)
      index = "table_records_#{@table_id}"
      page = options[:page] || 1
      limit = options[:limit] || @powerbase_table.page_size
      fields = PowerbaseField.where(powerbase_table_id: @table_id)
      primary_keys = fields.select {|field| field.is_primary_key }
      order_field = primary_keys.length > 0 ? primary_keys.first : fields.first

      number_field_type = PowerbaseFieldType.find_by(name: "Number")
      date_field_type = PowerbaseFieldType.find_by(name: "Date")

      if @is_turbo
        sort_column = {}

        if order_field.powerbase_field_type_id == number_field_type.id || order_field.powerbase_field_type_id == date_field_type.id
          sort_column[order_field.name.to_sym] = {
            order: "asc",
            unmapped_type: "long",
          }
        else
          sort_column["#{order_field.name}.keyword".to_sym] = {
            order: "asc",
            unmapped_type: "long",
          }
        end

        search_params = {
          from: (page - 1) * limit,
          size: limit,
          sort: [sort_column]
        }

        if options[:filters]
          query_string = Powerbase::QueryCompiler.new(options[:filters], @powerbase_database.adapter)
          search_params[:query] = {
            query_string: {
              query: query_string.to_elasticsearch,
            }
          }
        end

        result = @esclient.search(index: index, body: search_params)

        result["hits"]["hits"].map {|result| result["_source"]}
      else
        query_string = Powerbase::QueryCompiler.new(options[:filters], @powerbase_database.adapter)

        remote_db() {|db|
          db.from(@table_name)
            .order(order_field.name.to_sym)
            .where(options[:filters] ? eval(query_string.to_sequel) : true)
            .paginate(page, limit)
            .all
        }
      end
    end

    # * Get total table records.
    # Accepts the following options:
    # :filter :: a JSON that contains the filter for the records.
    def get_count(options)
      if @is_turbo
        index = "table_records_#{@table_id}"
        query = if options[:filters]
            query_string = Powerbase::QueryCompiler.new(options[:filters], @powerbase_database.adapter)
            "q=#{query_string.to_elasticsearch}"
          else
            nil
          end

        response = @esclient.perform_request("GET", "#{index}/_count?#{query}").body
        response["count"]
      else
        query_string = Powerbase::QueryCompiler.new(options[:filters], @powerbase_database.adapter)

        remote_db() {|db|
          db.from(@table_name)
            .where(options[:filters] ? eval(query_string.to_sequel) : true)
            .count
        }
      end
    end

    private
      def remote_db(&block)
        Powerbase.connect({
          adapter: @powerbase_database.adapter,
          connection_string: @powerbase_database.connection_string,
          is_turbo: @powerbase_database.is_turbo,
        }, &block)
      end

      def format_doc_id(value)
        value
          .parameterize(separator: "_")
          .truncate(ELASTICSEACH_ID_LIMIT)
      end

      def sanitize(string)
        string.gsub(/['"]/,'')
      end
  end
end