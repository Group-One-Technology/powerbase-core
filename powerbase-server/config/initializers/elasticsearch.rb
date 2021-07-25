require 'elasticsearch/model'

elasticsearch_url = if Rails.env.production?
    ENV["elasticsearch_url"]
  else
    ENV["elasticsearch_url_development"]
  end

logger = Logger.new("#{Rails.root}/log/elasticsearch.log")

ElasticsearchClient = Elasticsearch::Client.new url: elasticsearch_url, logger: logger
Elasticsearch::Model.client = Elasticsearch::Client.new url: elasticsearch_url, logger: logger
