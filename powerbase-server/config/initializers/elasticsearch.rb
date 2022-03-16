require 'elasticsearch/model'

elasticsearch_url = ENV["elasticsearch_url"]
connection_hash = {
  url: elasticsearch_url,
  port: 9200,
  scheme: "https",
  retry_on_failure: true,
  transport_options: {
    request: { timeout: 300 }
  }
}

ElasticsearchClient = Elasticsearch::Client.new(connection_hash)
Elasticsearch::Model.client = Elasticsearch::Client.new(connection_hash)
