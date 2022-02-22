class Databases::MetaQuery
  include SequelHelper

  attr_accessor :database

  def initialize(database)
    @database = database
  end

  # Get database size in kilobytes
  def database_size
    case @database.adapter
    when "postgresql"
      sequel_connect(@database) do |db|
        db.select(Sequel.lit('ROUND(pg_database_size(current_database()) / 1024, 2) AS size'))
          .first[:size]
      end
    when "mysql2"
      sequel_connect(@database) do |db|
        db.from(Sequel.lit("information_schema.TABLES"))
          .select(Sequel.lit("ROUND(SUM(data_length + index_length) / 1024, 2) AS size"))
          .where(Sequel.lit("table_schema = ?", @database.database_name))
          .first[:size]
      end
    end
  end

  def connection_stats(filter: nil)
    filter = nil if ![nil, "idle", "active"].include?(filter)

    if database.postgresql?
      sequel_connect(database) do |db|
        list = {}
        filter_query = {
          datname: database.database_name,
        }
        filter_query[:state] = filter if filter != nil
        list[:connections] = db.from(:pg_stat_activity).where(filter_query)
        list[:max_connections] = db.fetch("SHOW max_connections").first[:max_connections]
        list
      end
    else
      sequel_connect(database) do |db|
        list = {}
        list[:connections] = db.fetch("SHOW PROCESSLIST").all
          .select {|process| process[:db] == database.database_name}
        list[:max_used_connections] = db.fetch("SHOW STATUS LIKE \"max_used_connections\"").first[:Value]
        list[:max_connections] = db.fetch("SHOW VARIABLES LIKE \"max_connections\"").first[:Value]
        list
      end
    end
  end
end
