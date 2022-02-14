class Databases::MetaQuery
  include SequelHelper

  attr_accessor :database

  def initialize(database)
    @database = database
  end

  def connection_stats
    if database.postgresql?
      sequel_connect(database) do |db|
        list = {}
        list[:connections] = db.from(:pg_stat_activity).where(datname: database.database_name)
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
