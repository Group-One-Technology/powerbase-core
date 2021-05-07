ENV['RAILS_ENV'] ||= 'test'
require_relative "../config/environment"
require "rails/test_help"

class ActiveSupport::TestCase
  # Log worker on setup
  parallelize_setup do |worker|
    puts "Running test worker #{worker}"
  end

  # Drop database on teardown
  parallelize_teardown do |worker|
    configuration = ActiveRecord::Base.connection_db_config
    ActiveRecord::Tasks::DatabaseTasks.drop configuration
  end

  # Run tests in parallel with specified workers
  parallelize(workers: :number_of_processors)

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all
end
