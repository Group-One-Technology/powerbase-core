module ElasticsearchHelper
  ELASTICSEACH_ID_LIMIT = 512

  def client
    @es_client ||= ElasticsearchClient
  end

  def get_record(index, doc_id)
    client.get(index: index, id: doc_id)
  end

  def create_new_record(index, body, doc_id)
    client.index(index: index, id: format_doc_id(doc_id), body: body, refresh: true)
  end

  def update_record(index, doc_id, body)
    client.update(
      index: index,
      id: format_doc_id(doc_id),
      body: {
        doc: body,
        doc_as_upsert: true
      },
      refresh: true
    )
  end

  def delete_record(index, doc_id)
    client.delete(index: index, id: format_doc_id(doc_id), refresh: true)
  end

  def delete_index(index)
    client.perform_request("DELETE", "/#{index}")
  end

  def format_doc_id(value)
    value
      .parameterize(separator: "_")
      .truncate(ELASTICSEACH_ID_LIMIT)
  end

  def create_index!(index_name)
    if !client.indices.exists(index: index_name)
      client.indices.create(
        index: index_name,
        body: {
          settings: { "index.mapping.ignore_malformed": true },
        }
      )
    end
  end

  def get_doc_id(primary_keys, record, fields, adapter)
    if primary_keys.length > 0
      primary_keys
        .map {|key| "#{key.name}_#{record[key.name.to_sym]}" }
        .join("-")
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
  end
end