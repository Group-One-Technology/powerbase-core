require 'elasticsearch/model'

elasticsearch_url = if Rails.env.production?
    ENV["elasticsearch_url"]
  else
    ENV["elasticsearch_url_development"]
  end

ElasticsearchClient = Elasticsearch::Client.new url: elasticsearch_url, log: false
Elasticsearch::Model.client = Elasticsearch::Client.new url: elasticsearch_url, log: false
