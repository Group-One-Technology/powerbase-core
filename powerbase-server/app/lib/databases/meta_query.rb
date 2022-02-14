class Databases::MetaQuery
  include SequelHelper

  attr_accessor :database

  def initialize(database)
    @database = database
  end

  def active_connections
    if database.postgresql?
      sequel_connect(database) do |db|
        db.from(:pg_stat_activity)
          .where(state: "active", datname: database.database_name)
      end
    else
      processes = sequel_connect(database) {|db| db.fetch("SHOW PROCESSLIST").all }
      processes.select {|process| process[:db] == database.database_name}
    end
  end
end
