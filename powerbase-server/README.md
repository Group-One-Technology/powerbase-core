# Powerbase Server

Powerbase's api-server that is built with Rails.

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

4. Migrate and Seed the database. Make sure you have a PostgreSQL database named `powerbase`.

```bash
rails db:migrate
rails db:seed
```

5. Run the app and you're all set!

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
| rails db:reset db:migrate  | Reset database     |
| rails db:seed              | Seed database      |
| bundle exec sidekiq start  | Run sidekiq        |
| rails test                 | Run test cases     |
