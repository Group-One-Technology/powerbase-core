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

4. Run the app and you're all set!

```bash
# Run Rails server
rails s

# In another terminal, Run sidekiq
bundle exec sidekiq start
```
