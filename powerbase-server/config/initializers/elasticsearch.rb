require 'elasticsearch/model'

elasticsearch_url = if Rails.env.production?
    ENV["elasticsearch_url"]
  else
    ENV["elasticsearch_url_development"]
  end

logger = Logger.new("#{Rails.root}/log/elasticsearch.log")
logger.level = Logger::FATAL if Rails.env.production?

connection_hash = {
  url: elasticsearch_url,
  reload_connections: true,
  retry_on_failure: 3,
  request_timeout: 250,
  logger: logger,
}

ElasticsearchClient = Elasticsearch::Client.new(connection_hash)
Elasticsearch::Model.client = Elasticsearch::Client.new(connection_hash)
