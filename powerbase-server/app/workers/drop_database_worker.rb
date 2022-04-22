class DropDatabaseWorker < ApplicationWorker
  sidekiq_options queue: :critical
  sidekiq_options lock: :until_and_while_executing,
                  on_conflict: { client: :log, server: :reject }

  attr_accessor :database, :base_migration

  def perform(database_name, username)
    super

    puts "#{Time.now} -- Dropping database #{database_name} and user #{username}"
    powerbase = Powerbase::Schema.new
    powerbase.drop_database(database_name, username)
  end
end