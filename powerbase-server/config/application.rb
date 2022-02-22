require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module PowerbaseServer
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # Allows the conversion between camel case to snake case and vice versa.
    excluded_routes = -> (env) {
      env["PATH_INFO"].match(%r{^\/tables\/\S+\/(records|add_record|linked_records|update_record|update_field_data|delete_record)\S*})
       # /tables/:id/records
       # /tables/:id/linked_records
       # /tables/:id/add_record
       # /tables/:id/update_record
       # /tables/:id/update_field_data
       # /tables/:id/delete_record
       # /tables/:table_id/records/:id
    }
    config.middleware.use OliveBranch::Middleware,
      inflection: "camel",
      exclude_params: excluded_routes,
      exclude_response: excluded_routes

    # Set Sidekiq for background jobs
    config.active_job.queue_adapter = :sidekiq

    # Set Postmark for sending emails
    config.action_mailer.delivery_method = :postmark
    config.action_mailer.postmark_settings = {
      :api_token => ENV["POSTMARK_API_TOKEN"]
    }
  end
end
