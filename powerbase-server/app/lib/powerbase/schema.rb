include SequelHelper

class Powerbase::Schema
  attr_accessor :database_name, :username, :password, :connection_string

  def connection_string
    return nil if @username.nil? || @password.nil? || @database_name.nil?

    @connection_string ||= ("%{adapter}://%{user}:%{password}@%{host}/%{database}" % {
      adapter: "postgres",
      user: @username,
      password: @password,
      host: ENV["AWS_DATABASE_HOST"],
      database: @database_name,
    })
  end

  def create_unique_identifier
    next_id = PowerbaseDatabase.maximum(:id)

    begin
      @database_name = "d#{next_id}" + SecureRandom.alphanumeric(10).downcase
    end while PowerbaseDatabase.exists?(database_name: @database_name)

    @username = SecureRandom.send(:choose, [*'a'..'z'], 5) + SecureRandom.alphanumeric(5).downcase
    @password = SecureRandom.send(:choose, [*'a'..'z'], 5) + SecureRandom.alphanumeric(5).downcase
  end

  def create_role(role_name, create_db: false, create_role: false, inherit: false)
    options = "NOSUPERUSER"
    options += " #{create_db ? "CREATEDB" : "NOCREATEDB"}"
    options += " #{create_role ? "CREATEROLE" : "NOCREATEROLE"}"
    options += " #{inherit ? "INHERIT" : "NOINHERIT"}"

    Sequel.connect(ENV["AWS_DATABASE_CONNECTION"]) {|db|
      db.run("CREATE ROLE #{role_name} WITH #{options}")
    }
  end

  def drop_role(role_name)
    Sequel.connect(ENV["AWS_DATABASE_CONNECTION"]) {|db|
      db.run("DROP ROLE #{role_name}")
    }
  end

  def create_database
    # Generate random alphanumeric string for database name, username and password.
    create_unique_identifier

    # Create new user and database in SQL.
    Sequel.connect(ENV["AWS_DATABASE_CONNECTION"]) do |db|
      db.run("CREATE DATABASE #{@database_name}")

      db.run("REVOKE CONNECT ON DATABASE #{@database_name} FROM PUBLIC")
      db.run("CREATE USER #{@username} LOGIN ENCRYPTED PASSWORD '#{@password}' ROLE powerbase_user")

      # Didn't use alter database owner since the roles we receive from AWS RDS isn't a superuser but a rds_superuser
      db.run("GRANT CONNECT ON DATABASE #{@database_name} TO #{@username}")
      db.run("GRANT ALL PRIVILEGES ON DATABASE #{@database_name} TO #{@username}")
    end

    [@database_name, connection_string]
  end

  def drop_database(database_name, username = nil)
    Sequel.connect(ENV["AWS_DATABASE_CONNECTION"]) do |db|
      db.run("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '#{database_name}' AND pid <> pg_backend_pid() AND state in ('idle', 'idle in transaction', 'idle in transaction (aborted)', 'disabled') AND state_change < current_timestamp - INTERVAL '15' MINUTE;")

      if db.db_version < 13
        db.run("DROP DATABASE #{database_name}")
      else
        db.run("DROP DATABASE #{database_name} WITH (FORCE)")
      end
      db.run("DROP USER #{username}") if !username.nil?
    end
  end
end
