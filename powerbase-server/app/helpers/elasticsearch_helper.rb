include FieldTypeHelper

module ElasticsearchHelper
  ELASTICSEACH_ID_LIMIT = 512

  def client
    @es_client ||= ElasticsearchClient
  end

  def index_exists?(index_name)
    client.indices.exists(index: index_name)
  end

  def get_records_count(index, search_params)
    client.perform_request("GET", "#{index}/_count", {}, search_params).body
  end

  def get_record(index, doc_id)
    client.get(index: index, id: doc_id)
  end

  def search_records(index, body)
    client.search(index: index, body: body)
  end

  def create_new_record(index, body, doc_id)
    client.index(index: index, id: format_doc_id(doc_id), body: body, refresh: true)
  end

  def update_record(index, doc_id, body, is_upsert = true)
    if is_upsert
      client.update(
        index: index,
        id: format_doc_id(doc_id),
        body: {
          doc: body,
          doc_as_upsert: true
        },
        refresh: true
      )
    else
      client.update(
        index: index,
        id: format_doc_id(doc_id),
        body: { doc: body },
        _source: true
      )
    end
  end

  def remove_column(index, column_name)
    client.perform_request("POST", "#{index}/_update_by_query", {}, {
      script: "ctx._source.remove('#{column_name}')",
    })
  end

  def batch_update_records(index, query)
    client.perform_request("POST", "#{index}/_update_by_query", {}, query)
  end

  def delete_record(index, doc_id)
    client.delete(index: index, id: format_doc_id(doc_id), refresh: true)
  end

  def delete_index(index)
    begin
      client.perform_request("DELETE", "/#{index}") if index_exists?(index)
    rescue Elasticsearch::Transport::Transport::Errors::NotFound => ex
    end
  end

  def format_doc_id(value)
    if value.is_a?(Hash)
      value = value
        .sort_by{|key, value| key.downcase }
        .map {|key, value| "#{key}_#{value}" }
        .join("-")
    end

    value
      &.parameterize(separator: "_")
      &.truncate(ELASTICSEACH_ID_LIMIT)
  end

  def create_index!(index_name)
    if !index_exists?(index_name)
      begin
        client.indices.create(
          index: index_name,
          body: {
            settings: { "index.mapping.ignore_malformed": true },
          }
        )
      rescue Elasticsearch::Transport::Transport::Errors::BadRequest => error
        puts "#{Time.now} -- Index #{index_name} already exists."
      end
    end
  end

  def is_indexable?(doc_size, limit = 80.megabytes)
    # Default maximum size of HTTP request body in Elasticsearch is 100mb
    # See https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html
    doc_size < limit
  end

  def get_doc_size(doc)
    doc.to_json.bytesize.bytes
  end

  def get_doc_id(primary_keys, record, fields)
    if primary_keys.length > 0
      doc_id = primary_keys
        .sort_by{|key| key.name.downcase }
        .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
        .join("-")
    else
      field_ids = fields.select {|field|
        field.name.downcase.include?("id") || field.name.downcase.include?("identifier")
      }

      if field_ids.length > 0
        doc_id = field_ids
          .sort_by{|key| key.name.downcase }
          .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
          .join("-")
      else
        not_nullable_fields = fields.select {|field| !field.is_nullable }

        if not_nullable_fields.length > 0
          doc_id = not_nullable_fields
            .sort_by{|key| key.name.downcase }
            .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
            .join("-")
        else
          doc_id = fields
            .sort_by{|key| key.name.downcase }
            .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
            .join("-")
        end
      end
    end

    format_doc_id(doc_id)
  end

  # Format doc based on record field types
  def format_record(record, fields)
    formatted_record = {}

    record&.each do |record_key, record_value|
      field = fields.find {|field| field.name.to_sym == record_key }

      if !field
        error_message = "Field with name of #{record_key} could not be found."
        puts error_message
        Sentry.capture_message(error_message)
        next
      end

      if record_value == nil
        formatted_record[record_key] = nil
        next
      end

      formatted_record[record_key] = case field.powerbase_field_type_id
        when number_field_type.id
          if record_value.is_a?(String) &&Float(record_value, exception: false) != nil
            record_value.include?(".") ? record_value.to_f : record_value.to_i
          else
            record_value
          end
        when date_field_type.id
          date = DateTime.parse(record_value) rescue nil
          if date != nil
            date.utc.strftime("%FT%T.%L%z")
          else
            record_value
          end
        else
          %Q(#{record_value})
        end
    end

    formatted_record
  end

  def format_es_result(result)
    if result != nil
      result["hits"]["hits"].map do |result|
        if result["fields"] && result["fields"].length > 0
          result["fields"].each do |key, value|
            result["_source"][key] = value[0]
          end
        end

        result["_source"]&.symbolize_keys.merge("doc_id": result["_id"])
      end
    end
  end
end
