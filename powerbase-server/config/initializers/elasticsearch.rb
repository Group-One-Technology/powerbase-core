require 'elasticsearch/model'

elasticsearch_url = ENV["elasticsearch_url"]
connection_hash = {
  url: elasticsearch_url,
  reload_connections: true,
  retry_on_failure: 3,
  request_timeout: 50,
  retry_on_timeout: true,
}

ElasticsearchClient = Elasticsearch::Client.new(connection_hash)
Elasticsearch::Model.client = Elasticsearch::Client.new(connection_hash)
