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

Copy and rename `config/application.example.yml` to `config/application.yml` and update the variables.

4. Setup Elastic Search and Poxa

    4.1. Create a network called `powerbase`:

    ```bash
    docker network create powerbase
    ```

    4.2. Setup Elastic Search
    - Elasticsearch is used for indexing records for turbo bases, and magic values for non-turbo bases.

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

    4.3. Setup Kibana (optional)

    ```bash
    docker run \
        --name powerbase-kibana \
        --net powerbase \
        --publish 5601:5601 \
        --env "ELASTICSEARCH_HOSTS=http://powerbase-elasticsearch:9200" \
        docker.elastic.co/kibana/kibana-oss:7.10.2
    ```

    4.4. Setup Poxa
    - Poxa is used for real-time updates. Update the environment variables here and in `.env` as you wish.

    ```bash
    docker run \
        --name powerbase-poxa \
        --publish 6001:6001 \
        --env "PORT=6001" \
        --env "POXA_APP_ID=app-id" \
        --env "POXA_APP_KEY=app-key" \
        --env "POXA_SECRET=app-secret" \
        edgurgel/poxa-automated:latest
    ```

5. Setting up host for creating databases
- Add `POWERBASE_CLOUD_HOST` and `POWERBASE_CLOUD_DB_CONNECTION` to your `config/application.yml`  (should be localhost for your local environment and AWS for production)
  wherein
  - `POWERBASE_CLOUD_HOST` is the host w/ port where the databases will be created, can either be AWS RDS DB Instance host or your PostgreSQL localhost.
  - `POWERBASE_CLOUD_DB_CONNECTION` is the connection string that uses the `powerbase_app` role for the powerbase server to use.
- In your database host, create the `powerbase_app` role if there isn't any yet:
   NOTE: Update the password bellow:

```
-- Role of our powerbase server which creates databases and users.
CREATE USER powerbase_app WITH NOSUPERUSER CREATEDB CREATEROLE LOGIN ENCRYPTED PASSWORD 'enter your desired password here'

-- Then don't forget to give connect privilege to the main db (e.g. powerbase) to powerbase_app
GRANT CONNECT ON DATABASE powerbase TO powerbase_app

-- Enables powerbase_app to kill active connections and drop the database
GRANT pg_signal_backend TO powerbase_app;

-- After creating a powerbase_app user, don't forget to revoke connect privileges of existing databases from PUBLIC. This is so that newly created roles will have no access to the existing databases by default.
-- You can list all databases by:
SELECT * FROM pg_database
-- Then you can revoke connect privileges by:
REVOKE CONNECT ON DATABASE database_name FROM PUBLIC

6. Migrate and Seed the database. Make sure you have a PostgreSQL database named `powerbase` and Elastic Search installed and running.

```bash
# Will migrate the schema to PostgreSQL and import the indices for Elastic Search
rails db:migrate

# Will populate the database with initial values
rails db:seed
```

7. Run the app and you're all set!

```bash
# Run Rails server
rails s

# In another terminal, Run sidekiq
bundle exec sidekiq start
```

## Dockerizing the App

1. Clone Powerbase's core repository

```bash
git clone https://github.com/Group-One-Technology/powerbase-core.git
```

2. Go to the server's directory and setup the environment variables

```bash
cd powerbase-server
```

Copy and rename `.env.docker-example` to `.env` and update the variables.

3. Run docker

Build and run the docker container:

```bash
docker compose up
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
| heroku logs --tail -a app_name --dyno worker | Checkout Heroku sidekiq logs |
| heroku pg:killall -a app_name | Kill all the pg connection |
| git subtree push --prefix powerbase-server heroku master | Push powerbase-server code to Heroku |
