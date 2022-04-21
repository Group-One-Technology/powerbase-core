include SequelHelper

class Powerbase::Schema
  attr_accessor :database_name, :username, :password, :connection_string

  def connection_string
    return nil if @user.nil? || @password.nil? || @database_name.nil?

    @connection_string ||= ("%{adapter}://%{user}:%{password}@%{host}/%{database}" % {
      adapter: "postgres",
      user: @user,
      password: @password,
      host: ENV["AWS_DATABASE_HOST"],
      database: @database_name,
    })
  end

  def create_unique_identifier
    begin
      @database_name = SecureRandom.send(:choose, [*'a'..'z', *'A'..'Z'], 5) + SecureRandom.alphanumeric(10)
    end while PowerbaseDatabase.exists?(database_name: @database_name)

    @username = SecureRandom.send(:choose, [*'a'..'z', *'A'..'Z'], 5) + SecureRandom.alphanumeric(5)
    @password = SecureRandom.send(:choose, [*'a'..'z', *'A'..'Z'], 5) + SecureRandom.alphanumeric(5)
  end

  def create_database
    create_unique_identifier

    Sequel.connect(ENV["AWS_DATABASE_CONNECTION"]) do |db|
      db.run("CREATE DATABASE #{@database_name}")
      db.run("REVOKE CONNECT ON DATABASE #{@database_name} FROM PUBLIC")
      db.run("CREATE USER #{@username} LOGIN ENCRYPTED PASSWORD '#{@password}' ROLE powerbase_user")
      db.run("ALTER DATABASE #{@database_name} OWNER TO #{@username}")
    end

    @connection_string
  end
end
