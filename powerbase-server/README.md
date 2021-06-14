# Powerbase Server

Powerbase's api-server that is built with Rails.

## Pre-requisites

- [PostgreSQL](https://www.postgresql.org/)
- [Ruby 3.0.1](https://www.ruby-lang.org/en/)
- [Docker](https://www.docker.com/)

## Installation

1. Clone Powerbase's core repository

```bash
git clone https://github.com/Group-One-Technology/powerbase-core.git
```

2. Go to the server's directory and install the dependencies

```bash
cd powerbase-server
bundle install
```

3. Setup Environment Variables

Copy and rename `config/application.example.yml` to `config/application.example.yml` and update the ff variables.

4. Setup Elastic Search

    4.1. Create a network called `powerbase`:

    ```bash
    docker network create powerbase
    ```

    4.2. Setup Elastic Search

    ```bash
    docker run \
        --name powerbase-elasticsearch \
        --net powerbase \
        --publish 9200:9200 \
        --env "discovery.type=single-node" \
        --env "cluster.name=elasticsearch-rails" \
        --env "cluster.routing.allocation.disk.threshold_enabled=false" \
        docker.elastic.co/elasticsearch/elasticsearch-oss:7.10.2
    ```

    4.3. Setup Kibana

    ```bash
    docker run \
        --name powerbase-kibana \
        --net powerbase \
        --publish 5601:5601 \
        --env "ELASTICSEARCH_HOSTS=http://powerbase-elasticsearch:9200" \
        docker.elastic.co/kibana/kibana-oss:7.10.2
    ```

5. Migrate and Seed the database. Make sure you have a PostgreSQL database named `powerbase` and Elastic Search installed and running.

```bash
# Will migrate the schema to PostgreSQL and import the indices for Elastic Search
rails db:migrate

# Will populate the database with initial values
rails db:seed
```

6. Run the app and you're all set!

```bash
# Run Rails server
rails s

# In another terminal, Run sidekiq
bundle exec sidekiq start
```

## Testing the server

1. Prepare the test database if you don't have on yet.

```bash
rails db:test:prepare
```

2. Run the tests

```bash
rails test
```

## Helpful Commands

| Comand                     |     Description    |
| :------------------------- | :----------------: |
| rails s                    | Start server       |
| rails db:migrate           | Migrate database   |
| rails db:schema:load       | Reset database     |
| rails db:seed              | Seed database      |
| bundle exec sidekiq start  | Run sidekiq        |
| rails test                 | Run test cases     |
| bundle exec rake environment elasticsearch:import:model CLASS='MODEL_NAME_HERE' SCOPE='turbo' | Import data to elastic search |
