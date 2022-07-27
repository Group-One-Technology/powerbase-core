module Powerbase
  class QueryCompiler
    PARENTHESIS = ['(', ')']
    NULL_OPERATORS = ['is empty', 'is not empty']
    RELATIONAL_OPERATORS = [
      ...NULL_OPERATORS,
      '<', '>', '=', '<=', '>=', '!=',
      'is', 'is not', 'contains', 'does not contain',
      'is exact date', 'is not exact date', 'is before', 'is after', 'is on or before', 'is on or after',
    ]
    DATE_OPERATORS = ['is exact date', 'is not exact date', 'is before', 'is after', 'is on or before', 'is on or after']
    LOGICAL_OPERATORS = ['and', 'or', 'not']
    TOKEN = {
      number: 'NUMBER',
      field: 'FIELD',
      string: 'STRING',
      relational_operator: 'RELATIONAL_OPERATOR',
      logical_operator: 'LOGICAL_OPERATOR',
      open_parenthesis: 'OPEN_PARENTHESIS',
      close_parenthesis: 'CLOSE_PARENTHESIS',
    }

    # Accepts the following options:
    # :query :: a query string for search.
    # :filter :: a query string or hash for filtering.
    # :sort :: a sort hash.
    # :include_pii :: a boolean for whether to query pii fields or not.
    # :include_json :: a boolean for whether to substring the queried json fields or not.
    # :include_large_text :: a boolean for whether to substring the queried text fields or not.
    def initialize(table, options = {})
      @table = table.is_a?(ActiveRecord::Base) ? table : PowerbaseTable.find(table)
      @table_id = @table.id
      @database = @table.db
      @adapter = @database.adapter || "postgresql"
      @turbo = @database.is_turbo || @table.is_virtual || false

      @query = options[:query] ? sanitize(options[:query]) : nil
      @filter = options[:filter] || nil
      @sort = options[:sort] == nil ? [] : options[:sort]
      @include_pii = options[:include_pii] || false
      @include_json = options[:include_json] || false
      @include_large_text = options[:include_large_text] || false
      @is_magic_sort = false
      @is_magic_filter = false

      @fields = @table.fields.order(name: :asc).reload
      @actual_fields = @fields.select {|item| !item.is_virtual}
      @magic_fields = @fields.select {|item| item.is_virtual}
      @field_types = PowerbaseFieldType.all
      @field_type = {}
      @field_types.each {|field_type| @field_type[field_type.id] = field_type.name }
    end

    # * Find records by their fields.
    # Used in conjunction with to_sequel or to_elasticsearch
    # Ex: query_string.find_by({ is_completed: true, year: 2001 }).to_sequel
    def find_by(filters)
      operator = @turbo ? "is" : "="

      updated_filters = filters
        .collect {|key, value| key }
        .map do |field|
          next {
            field: field,
            filter: { operator: operator, value: filters[field].to_s }
          }
        end

      @filter = { operator: "and", filters: updated_filters }

      self
    end

    # * Returns sequel proc query
    def to_sequel
      included_fields = filtered_fields

      if !@include_json
        json_fields = included_fields.select {|field| @field_type[field.powerbase_field_type_id] == "JSON Text"}
        included_fields = included_fields.select {|field| @field_type[field.powerbase_field_type_id] != "JSON Text"}
      end

      text_field_names = included_fields
        .select {|field| ["Single Line Text", "Long Text"].include?(@field_type[field.powerbase_field_type_id])}
        .map {|field| field.name}
      included_fields = included_fields
        .select {|field| !text_field_names.include?(field.name)}
        .map {|field| field.name.to_sym}

      initial_select = false

      -> (db) {
        if included_fields.length > 0
          db = db.select(*included_fields)
          initial_select = true
        end

        # Max character size is 1,000,000 cause at around 100,000,000 the browser freezes.
        text_size = !@include_large_text ? "200" : "1000000"
        text_field_names.each do |field_name|
          select_query = nil
          count_select_query = nil

          if @adapter == "mysql2"
            select_query = Sequel.lit(%Q[
              (
                CASE
                  WHEN LENGTH('#{field_name}') > #{text_size}
                  THEN SUBSTRING('#{field_name}', 1, #{text_size}) || '...'
                  ELSE '#{field_name}'
                END
              ) AS '#{field_name}'
            ])
            count_select_query = Sequel.lit(%Q[LENGTH('#{field_name}') AS '#{field_name}_count'])
          else # postgresql
            select_query = Sequel.lit(%Q[
              (
                CASE
                  WHEN LENGTH("#{field_name}") > #{text_size}
                  THEN SUBSTRING("#{field_name}", 1, #{text_size}) || '...'
                  ELSE "#{field_name}"
                END
              ) AS "#{field_name}"
            ])
            count_select_query = Sequel.lit(%Q[LENGTH("#{field_name}") AS "#{field_name}_count"])
          end
          
          if !initial_select
            db = db.select(select_query)
            initial_select = true
          else
            db = db.select_append(select_query)
          end
          
          db = db.select_append(count_select_query)
        end

        if !@include_json
          json_fields.each do |field|
            select_query = nil
            if @adapter == "mysql2"
              select_query = Sequel.lit(%Q[SUBSTRING('#{field.name}', 1, 40) AS '#{field.name}'])
            else # postgresql
              select_query = Sequel.lit(%Q[SUBSTRING("#{field.name}", 1, 40) AS "#{field.name}"])
            end

            if !initial_select
              db = db.select(select_query)
              initial_select = true
            else
              db = db.select_append(select_query)
            end
          end
        end

        # For full text search
        if @query != nil && @query.length > 0
          filters = @actual_fields.map do |field|
            field_type = @field_type[field.powerbase_field_type_id]
            column = {}
            column[field.name.to_sym] = @query

            if field.db_type && field.db_type == "uuid"
              next if !validate_uuid_format(@query)
              next Sequel[column]
            end
            next if field_type == "Number" && Float(@query, exception: false) == nil
            next if field_type == "Date" || field_type == "Checkbox"

            if field_type == "Single Line Text" || field_type == "Long Text"
              next Sequel.ilike(field.name.to_sym, "%#{@query}%")
            end

            Sequel[column]
          end

          filters = filters.select {|item| item != nil}
            .inject {|filter, item| Sequel.|(filter, item)}

          db = db.where(filters)
        end

        # For filtering
        if @filter != nil
          parsedTokens = if @filter.is_a?(String)
              tokens = lexer(@filter)
              parser(tokens)
            else
              @filter
            end

          filters = transform_sequel_filter(parsedTokens)
          db = db.where(filters) if filters != nil
        end

        # For sorting
        sequel_sort = format_sort
        if sequel_sort.kind_of?(Array) && sequel_sort.length > 0
          sequel_sort.each do |sort_item|
            if sort_item[:operator] == "asc"
              db = db.order_append(Sequel.asc(sort_item[:field].to_sym, :nulls => :last))
            else
              db = db.order_append(Sequel.desc(sort_item[:field].to_sym, :nulls => :last))
            end
          end
        end

        db
      }
    end

    # * Returns elasticsearch hash query
    def to_elasticsearch
      included_fields = filtered_fields(!@turbo, true)

      return nil if !@turbo && included_fields.length == 0

      search_params = {
        _source: { includes: included_fields.map {|field| field.name} }
      }

      if !@include_json
        json_fields = included_fields
          .select {|field| @field_type[field.powerbase_field_type_id] == "JSON Text"}
          .map{|field| field.name }

        search_params[:script_fields] = {}

        json_fields.each do |field_name|
          search_params[:script_fields][field_name.to_sym] = {
            script: {
              lang: "painless",
              source: "if (params._source[\"#{field_name}\"] != null && params._source[\"#{field_name}\"].length() > 40) { return params._source[\"#{field_name}\"].substring(0, 40) } else { return params._source[\"#{field_name}\"] }",
            },
          }
        end
      end

      text_field_names = included_fields
        .select {|field| ["Single Line Text", "Long Text"].include?(@field_type[field.powerbase_field_type_id])}
        .map {|field| field.name}

      # Max character size is 1,000,000 cause at around 100,000,000 the browser freezes.
      text_size = "1000000"
      search_params[:script_fields] = {}

      text_field_names.each do |field_name|
        if !@include_large_text
          search_params[:script_fields][field_name.to_sym] = {
            script: {
              lang: "painless",
              source: "if (params._source[\"#{field_name}\"] != null && params._source[\"#{field_name}\"].length() > #{text_size}) { return params._source[\"#{field_name}\"].substring(0, #{text_size}) } else { return params._source[\"#{field_name}\"] }",
            },
          }
        end

        search_params[:script_fields]["#{field_name}_count".to_sym] = {
          script: {
            lang: "painless",
            source: "if (params._source[\"#{field_name}_count\"] != null) { return params._source[\"#{field_name}_count\"] } else { return null }",
          },
        }
      end

      # For sorting
      es_sort = format_sort(!@turbo, true)
      if es_sort.kind_of?(Array) && es_sort.length > 0
        sort_param = es_sort.map do |sort_item|
          sort_field = if @turbo
              @table.fields.find {|field| field.name == sort_item[:field] }
            else
              @magic_fields.find {|field| field.name == sort_item[:field] }
            end
          sort_column = {}

          if sort_field
            column_name = if @field_type[sort_field.powerbase_field_type_id] == "Number"
                if sort_field.is_decimal?
                  "#{sort_field.name}.keyword"
                else
                  sort_field.name
                end
              elsif @field_type[sort_field.powerbase_field_type_id] == "Date"
                sort_field.name
              else
                "#{sort_field.name}.keyword"
              end

            sort_column[column_name] = { order: sort_item[:operator], unmapped_type: "long" }
          end

          sort_column
        end
        search_params[:sort] = sort_param
      end

      # For filtering
      if @filter != nil || (@query && @query.length > 0)
        parsedTokens = if @filter.is_a?(String)
            tokens = lexer(@filter)
            parser(tokens)
          else
            @filter
          end
        query_string = transform_elasticsearch_filter(parsedTokens, @query, !@turbo)

        if query_string.length > 0
          @is_magic_filter = !@turbo
          search_params[:query] = {
            query_string: {
              query: query_string,
              time_zone: "+00:00"
            }
          }
        end
      end

      search_params
    end

    def merge_records(records, magic_records)
      primary_keys = @table.primary_keys
      actual_fields = @table.actual_fields
      merged_records = nil

      if magic_records == nil || magic_records.length == 0
        records.map do |record|
          doc_id = get_doc_id(primary_keys, record, actual_fields)
          record.merge(doc_id: doc_id)
        end
      end

      if @is_magic_sort
        merged_records = magic_records.map do |magic_record|
          record = get_record_by_key(records, magic_record, primary_keys)
          next nil if !record
          { **magic_record, **record }
        end
          .select {|item| item != nil}

        other_records = records.filter do |record|
          magic_record = get_record_by_key(magic_records, record, primary_keys)
          magic_record == nil
        end

        merged_records = [*merged_records, *other_records]
      else
        merged_records = records.map do |record|
          magic_record = get_record_by_key(magic_records, record, primary_keys) || {}
          { **magic_record, **record }
        end
      end

      if @is_magic_filter
        merged_records = merged_records.select do |merged_record|
          magic_record = magic_records.find {|item| item[:doc_id] == merged_record[:doc_id]}
          magic_record != nil
        end
      end

      merged_records.map do |record|
        next record if record[:doc_id] != nil

        doc_id = get_doc_id(primary_keys, record, actual_fields)
        record.merge(doc_id: doc_id)
      end
    end

    private
      # * Analyze the tokens in a given code/string
      # Accepts the following options:
      # :param :: a query string.
      #    Ex: '(((occupation == "Student") AND (age > 18)) OR (enrollment_year >= 1998))'
      # Returns: an array of tokens
      def lexer(code)
        code.split(/\s+/)
          .select {|string| string.length > 0}
          .map do |string|
            tokens = string.split("").reduce([]) do |found_tokens, character|
              if PARENTHESIS.include?(character)
                next [*found_tokens, character]
              end

              last_character = found_tokens[found_tokens.length - 1]
              last_token = if PARENTHESIS.include?(last_character) || last_character == nil
                  character
                else
                  last_character + character
                end

              found_tokens.pop() if !PARENTHESIS.include?(last_character) && last_character != nil

              next [*found_tokens, last_token]
            end

            tokens.map do |token|
              if PARENTHESIS.include?(token)
                next {
                  type: token == "(" ? TOKEN[:open_parenthesis] : TOKEN[:close_parenthesis],
                  value: token
                }
              elsif RELATIONAL_OPERATORS.include?(token) || DATE_OPERATORS.include(token)
                next { type: TOKEN[:relational_operator], value: token }
              elsif LOGICAL_OPERATORS.include?(token)
                next { type: TOKEN[:logical_operator], value: token }
              elsif token[0] == "\"" && token[token.length - 1] == "\""
                next { type: TOKEN[:string], value: token[1, token.length - 2] }
              elsif token[0] == "'" && token[token.length - 1] == "'"
                next { type: TOKEN[:string], value: token[1, token.length - 1] }
              elsif Float(token, exception: false) != nil
                next { type: TOKEN[:number], value: token.include?(".") ? token.to_f : token.to_i }
              else
                next { type: TOKEN[:field], value: token };
              end
            end
          end
          .flatten
      end

      # * Builds the filter tree
      # Accepts the following options:
      # :cur_ast :: the current logical filter.
      # :ast :: an array of filters.
      def build_tree(cur_ast, ast)
        filters = ast.select {|item| item[:parent_index] == cur_ast[:index] }
          .map{|item| item[:operator] ? build_tree(item, ast) : item }

        cur_ast[:filters] = filters
        cur_ast
      end

      # * Parses the tokens into a filter tree
      def parser(tokens)
        ast = []
        level = 0
        root_index = nil

        while tokens.length > 0
          current_token = tokens.shift();

          case current_token[:type]
          when TOKEN[:open_parenthesis]
            level += 1
          when TOKEN[:close_parenthesis]
            level -= 1
          when TOKEN[:logical_operator]
            if !root_index && level == 1
              root_index = ast.length
            elsif root_index && level == 1
              exit
            end

            last_parent = ast.select {|item| item[:level] == level - 1 && item[:operator]&.length }.last

            ast.push({
              index: ast.length,
              level: level,
              parent_index: level > 1 && last_parent ? last_parent[:index] : nil,
              operator: current_token[:value],
            })

            ast = ast.map do |cur_ast, index|
              if cur_ast[:operator]&.length || !cur_ast[:parent_index]
                parents = ast.select {|item| item[:level] == cur_ast[:level] - 1 && item[:operator]&.length }
                lastParent = parents[parents.length - 1]
                cur_ast[:parent_index] = lastParent ? lastParent[:index] : nil
                next cur_ast
              end

              next cur_ast
            end
          when TOKEN[:field]
            operator = tokens.shift();
            operand = tokens.shift();

            if operator[:type] != TOKEN[:relational_operator]
              raise StandardError.new "Expecting a relational operator after #{current_token[:value]} but received #{operator[:type]} instead."
            elsif operand[:type] != TOKEN[:string] && operand[:type] != TOKEN[:number] && operand[:type] != TOKEN[:field]
              raise StandardError.new "Expecting a value or field after #{operator[:value]} but received #{operand[:type]} instead."
            end

            last_parent = ast.select {|item| item[:level] == level - 1 && item[:operator]&.length }.last

            ast.push({
              index: ast.length,
              level: level,
              parent_index: last_parent ? last_parent[:index] : nil,
              field: current_token[:value],
              filter: { operator: operator[:value], value: operand[:value] },
            })
          end
        end

        ast = ast.sort {|a, b| b[:level] <=> a[:level] }
        root_node = ast.find {|item| item[:parent_index] == nil && item[:operator]&.length }

        if root_node == nil
          ast.push({
            index: ast.length,
            level: 1,
            parent_index: nil,
            operator: "and",
          })

          ast.map do |cur_ast|
            if cur_ast[:parent_index] == nil && cur_ast[:operator] == nil
              cur_ast[:parent_index] = ast.length - 1
            end

            next cur_ast
          end

          root_node = ast[ast.length - 1]
        end

        build_tree(root_node, ast)
      end

      # * Transforms parsed tokens into a sequel value
      def transform_sequel_filter(filter_group)
        filters = filter_group ? filter_group[:filters] : []
        filters = filters.map do |filter|
          inner_filter_group = filter[:filters]

          if inner_filter_group && inner_filter_group.length > 0
            next transform_sequel_filter(filter)
          end

          field = @actual_fields.find {|item| item.name.to_s == filter[:field].to_s}
          next if !field

          field_type = @field_type[field.powerbase_field_type_id]
          relational_op = filter[:filter][:operator]
          column_field = field.name
          column_value = sanitize(filter[:filter][:value])
          column = {}

          if relational_op == "is empty"
            column[column_field.to_sym] = nil
            next Sequel[column]
          elsif relational_op == "is not empty"
            column[column_field.to_sym] = nil
            next Sequel.~(column)
          elsif column_value == nil || (column_value.to_s.length == 0)
            next
          end

          column[column_field.to_sym] = column_value

          if field_type == "Date"
            column_field = if @adapter == "mysql2"
                Sequel.lit(%Q[DATE_FORMAT('#{field.name}', '%Y-%m-%d')])
              else # postgresql
                Sequel.lit(%Q[to_char("#{field.name}", 'YYYY-MM-DDThh:mm:ss')::TIMESTAMP::DATE])
              end
            column_value = if @adapter == "mysql2"
                Sequel.lit(%Q[DATE_FORMAT(CONVERT_TZ('#{format_date(value)}', '+00:00', CONCAT('+', SUBSTRING(timediff(NOW(), CONVERT_TZ(now(),@@session.time_zone,'+00:00')), 1, 5))), '%Y-%m-%d')])
              else # postgresql
                Sequel.lit(%Q[to_char(('#{format_date(value)}'::TIMESTAMP at TIME ZONE 'UTC' at TIME ZONE current_setting('TIMEZONE')), 'YYYY-MM-DDThh:mm:ss')::TIMESTAMP::DATE])
              end

            case relational_op
            when "is exact date"
              next Sequel[column]
            when "is not exact date"
              next Sequel.~(column)
            when "is before"
              next Sequel::SQL::BooleanExpression.new(:<, column_field, column_value)
            when "is after"
              next Sequel::SQL::BooleanExpression.new(:>, column_field, column_value)
            when "is on or before"
              next Sequel::SQL::BooleanExpression.new(:<=, column_field, column_value)
            when "is on or after"
              next Sequel::SQL::BooleanExpression.new(:>=, column_field, column_value)
            end
          end

          case relational_op
          when "is"
            next Sequel[column]
          when "is not"
            next Sequel.~(column)
          when "contains"
            next Sequel.ilike(column_field.to_sym, "%#{column_value}%")
          when "does not contain"
            next ~Sequel.ilike(column_field.to_sym, "%#{column_value}%")
          when "="
            next Sequel[column]
          when "!="
            next Sequel.~(column)
          when "<"
            next Sequel::SQL::BooleanExpression.new(:<, column_field.to_sym, column_value)
          when ">"
            next Sequel::SQL::BooleanExpression.new(:>, column_field.to_sym, column_value)
          when "<="
            next Sequel::SQL::BooleanExpression.new(:<=, column_field.to_sym, column_value)
          when ">="
            next Sequel::SQL::BooleanExpression.new(:>=, column_field.to_sym, column_value)
          end
        end

        filters.select {|item| item != nil}
          .inject do |filter, item|
            next Sequel.|(filter, item) if filter_group != nil && filter_group[:operator] == "or"
            next Sequel.&(filter, item)
          end
      end

      # * Transforms parsed tokens into elasticsearch query string
      def transform_elasticsearch_filter(filter_group, search_query = nil, is_magic_values = false)
        logical_op = if filter_group != nil && filter_group[:operator]
            if filter_group[:operator] == "or"
              "OR"
            else
              "AND"
            end
          else
            "AND"
          end

        filters = filter_group ? filter_group[:filters] || [] : []

        elasticsearch_filter = filters.map do |filter|
          inner_filter_group = filter[:filters]

          if inner_filter_group && inner_filter_group.length > 0
            next transform_elasticsearch_filter(filter, nil, is_magic_values)
          end

          cur_field = if is_magic_values
              filter_field = @magic_fields.find {|item| item.name.to_s == filter[:field].to_s}
              if filter_field == nil
                filter_field = @table.primary_keys.find {|item| item.name.to_s == filter[:field].to_s}
              end
              filter_field
            else
              @table.fields.find {|item| item.name.to_s == filter[:field].to_s}
            end
          next if !cur_field

          relational_op = filter[:filter][:operator]
          field = cur_field.name
          value = sanitize(filter[:filter][:value])

          if relational_op == "is empty"
            next "((NOT _exists_:#{field}) OR #{field}.keyword:\"\")"
          elsif relational_op == "is not empty"
            next "(_exists_:#{field} OR NOT #{field}.keyword:\"\")"
          elsif value == nil || (value.to_s.length == 0)
            next
          end

          case relational_op
          when "is"
            "#{field}:\"#{value}\""
          when "is not"
            "(NOT #{field}:\"#{value}\")"
          when "contains"
            "#{field}:*#{value}*"
          when "does not contain"
            "(NOT #{field}:*#{value}*)"
          when "="
            "#{field}:#{value}"
          when "!="
            "(NOT #{field}:#{value})"
          when ">"
            "#{field}:>#{value}"
          when ">="
            "#{field}:>=#{value}"
          when "<"
            "#{field}:<#{value}"
          when "<="
            "#{field}:<=#{value}"
          when "is exact date"
            "#{field}:#{format_date(value, true)}"
          when "is not exact date"
            "(NOT #{field}:#{format_date(value, true)})"
          when "is before"
            "(#{field}:[* TO #{format_date(value, true, -1.days)}])"
          when "is after"
            "(#{field}:[#{format_date(value, true, 1.days)} TO *])"
          when "is on or before"
            "(#{field}:[* TO #{format_date(value, true)}])"
          when "is on or after"
            "(#{field}:[#{format_date(value, true)} TO *])"
          end
        end

        query_string = elasticsearch_filter
          .select {|item| item != nil}
          .join(" #{logical_op.upcase} ")
        query_string = query_string && query_string.length > 0 ? "(#{query_string})" : ""

        if search_query != nil && search_query.length > 0
          if query_string.length > 0
            "*:\"#{sanitize(search_query)}\" AND (#{query_string})"
          else
            "*:\"#{sanitize(search_query)}\""
          end
        else
          query_string
        end
      end

      # * Remove escaped quotes
      def sanitize(value)
        value.class == String ? value.gsub(/['"#()]/,' ') : value
      end

      # * Format date to UTC
      def format_date(value, is_turbo = false, increment = nil)
        date = DateTime.parse(value) rescue nil

        if date != nil
          if is_turbo
            if increment != nil
              (date.utc + increment).strftime("%Y-%m-%d")
            else
              date.utc.strftime("%Y-%m-%d")
            end
          elsif increment != nil
              (date.utc + increment).strftime("%FT%T")
          else
            date.utc.strftime("%FT%T")
          end
        else
          nil
        end
      end

      # * Check if valid uuid
      def validate_uuid_format(uuid)
        uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        return true if uuid_regex.match?(uuid.to_s.downcase)
        false
      end

      def filtered_fields(is_magic_records = false, is_elasticsearch = false)
        included_fields =  if !is_elasticsearch
            @actual_fields
          elsif is_magic_records
            primary_key_fields = @actual_fields.select {|field| field.is_primary_key}
            [*@magic_fields, *primary_key_fields]
          else
            @fields
          end

        if !@include_pii
          included_fields = included_fields.select {|field| !field.is_pii}
        end

        included_fields
      end

      def format_sort(is_magic_values = false, is_elasticsearch = false)
        return [] if !@sort
        formatted_sort = if @sort.kind_of?(Array) && @sort.length > 0
          @sort.map do |sort_item|
            operator = if sort_item[:operator] == "descending" || sort_item[:operator] == "desc"
                "desc"
              else
                "asc"
              end

            { field: sort_item[:field], operator: operator }
          end
        elsif @sort.kind_of?(Array)
          primary_keys = @fields.select {|field| field.is_primary_key }
          order_field = if primary_keys.length > 0
              primary_keys.first
            elsif !@turbo
              @actual_fields.first
            elsif is_magic_values
              @magic_fields.first
            end

          order_field != nil ? [{ field: order_field.name, operator: "asc" }] : []
        end

        if is_magic_values
          formatted_sort = formatted_sort.select do |sort_item|
            !!@magic_fields.find{|item| item.name == sort_item[:field].to_s}
          end
          @is_magic_sort = true if formatted_sort.length > 0
          formatted_sort
        elsif is_elasticsearch
          formatted_sort
        else
          formatted_sort.select do |sort_item|
            !!@actual_fields.find{|item| item.name == sort_item[:field].to_s}
          end
        end
      end

      def get_record_by_key(records, record, primary_keys)
        records.find do |item|
          is_found = true

          primary_keys.each do |key|
            key_name = key.name.to_sym
            is_found = false if item[key_name] != record[key_name]
          end

          next is_found
        end
      end
  end
end
