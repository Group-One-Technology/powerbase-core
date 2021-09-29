module Powerbase
  class QueryCompiler
    PARENTHESIS = ['(', ')']
    RELATIONAL_OPERATORS = [
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
    # :query :: a query string for filtering
    # :sort :: a sort hash
    # :adapter :: the database adapter used. Can either be mysql2 or postgresql
    def initialize(options)
      @query = options[:query] || nil
      @sort = options[:sort] || []
      @adapter = options[:adapter] || "postgresql"
    end

    # * Find records by their fields.
    # Used in conjunction with to_sequel or to_elasticsearch
    # Ex: query_string.find_by({ is_completed: true, year: 2001 }).to_sequel
    def find_by(filters)
      updated_filters = filters
        .collect {|key, value| key }
        .map do |field|
          next {
            field: field,
            filter: { operator: "=", value: filters[field].to_s }
          }
        end

      @query = { operator: "and", filters: updated_filters }

      self
    end

    # * Transform given query string or hash into sequel query string
    def to_sequel
      parsedTokens = if @query.is_a?(String)
          tokens = lexer(@query)
          parser(tokens)
        else
          @query
        end

      transform_sequel_filter(parsedTokens)
    end

    # * Transform given query string or hash into elasticsearch query string
    def to_elasticsearch
      parsedTokens = if @query.is_a?(String)
          tokens = lexer(@query)
          parser(tokens)
        else
          @query
        end

      transform_elasticsearch_filter(parsedTokens)
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
              elsif RELATIONAL_OPERATORS.include?(token)
                next { type: TOKEN[:relational_operator], value: token }
              elsif LOGICAL_OPERATORS.include?(token)
                next { type: TOKEN[:logical_operator], value: token }
              elsif token[0] == "\"" && token[token.length - 1] == "\""
                next { type: TOKEN[:string], value: token[1, token.length - 2] }
              elsif token[0] == "'" && token[token.length - 1] == "'"
                next { type: TOKEN[:string], value: token[1, token.length - 1] }
              elsif Float(token, exception: false)
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

      # * Transforms parsed tokens into a sequel query string
      def transform_sequel_filter(filter_group)
        logical_op = case filter_group[:operator]
          when "or"
            "|"
          else
            "&"
          end

        filters = filter_group[:filters]

        sequel_filter = filters.map do |filter|
          inner_filter_group = filter[:filters]

          if inner_filter_group && inner_filter_group.length > 0
            next transform_sequel_filter(filter)
          end

          relational_op = filter[:filter][:operator]
          field = if DATE_OPERATORS.include?(relational_op) && @adapter == "postgresql"
              "Sequel.lit(%Q[to_char(\"#{sanitize(filter[:field])}\", 'YYYY-MM-DDThh:mm:ss')::TIMESTAMP::DATE])"
            elsif DATE_OPERATORS.include?(relational_op) && @adapter == "mysql2"
              "Sequel.lit(%Q[DATE_FORMAT('#{sanitize(filter[:field])}', '%Y-%m-%d')])"
            elsif @adapter == "postgresql"
              "Sequel.lit('\"#{sanitize(filter[:field])}\"')"
            else
              "Sequel.lit('#{sanitize(filter[:field])}')"
            end
          value = if DATE_OPERATORS.include?(relational_op) && @adapter == "postgresql"
              "Sequel.lit(%Q[to_char(('#{format_date(sanitize(filter[:filter][:value]))}'::TIMESTAMP at TIME ZONE 'UTC' at TIME ZONE current_setting('TIMEZONE')), 'YYYY-MM-DDThh:mm:ss')::TIMESTAMP::DATE])"
            elsif DATE_OPERATORS.include?(relational_op) && @adapter == "mysql2"
              "Sequel.lit(%Q[DATE_FORMAT(CONVERT_TZ('#{format_date(sanitize(filter[:filter][:value]))}', '+00:00', CONCAT('+', SUBSTRING(timediff(now(), CONVERT_TZ(now(),@@session.time_zone,'+00:00')), 1, 5))), '%Y-%m-%d')])"
            else
              sanitize(filter[:filter][:value])
            end

          case relational_op
          when "is"
            "Sequel[{#{field} => '#{value}'}]"
          when "is not"
            "Sequel.~(#{field} => '#{value}')"
          when "contains"
            "Sequel.ilike(#{field}, '%#{value}%')"
          when "does not contain"
            "~Sequel.ilike(#{field}, '%#{value}%')"
          when "="
            "Sequel[{#{field} => #{value}}]"
          when "!="
            "Sequel.~(#{field} => #{value})"
          when "<"
            "(#{field} < #{value})"
          when ">"
            "(#{field} > #{value})"
          when "<="
            "((#{field} < #{value}) | Sequel[{#{field} => #{value}}])"
          when ">="
            "((#{field} > #{value}) | Sequel[{#{field} => #{value}}])"
          when "is exact date"
            "Sequel[{#{field} => #{value}}]"
          when "is not exact date"
            "Sequel.~(#{field} => #{value})"
          when "is before"
            "(#{field} < #{value})"
          when "is after"
            "(#{field} > #{value})"
          when "is on or before"
            "((#{field} < #{value}) | Sequel[{#{field} => #{value}}])"
          when "is on or after"
            "((#{field} > #{value}) | Sequel[{#{field} => #{value}}])"
          end
        end

        query_string = sequel_filter.join(" #{logical_op} ")
        "(#{query_string})"
      end

      # * Transforms parsed tokens into elasticsearch query string
      def transform_elasticsearch_filter(filter_group)
        logical_op = case filter_group[:operator]
          when "or"
            "OR"
          else
            "AND"
          end

        filters = filter_group[:filters]

        elasticsearch_filter = filters.map do |filter|
          inner_filter_group = filter[:filters]

          if inner_filter_group && inner_filter_group.length > 0
            next transform_elasticsearch_filter(filter)
          end

          relational_op = filter[:filter][:operator]
          field = sanitize(filter[:field])
          value = sanitize(filter[:filter][:value])

          case relational_op
          when "is"
            "#{field}:\"#{value}\""
          when "is not"
            "(NOT #{field}:#{value})"
          when "contains"
            "#{field}:#{value}"
          when "does not contain"
            "(NOT #{field}:#{value})"
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

        query_string = elasticsearch_filter.join(" #{logical_op.upcase} ")
        "(#{query_string})"
      end

      # * Remove escaped quotes
      def sanitize(value)
        value.class == String ? value.gsub(/['"#]/,'') : value
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
  end
end
