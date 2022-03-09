class Databases::ConnectionValidator
  def initialize(adapter: nil, host: nil, port: nil, user: nil, password: nil, database: nil, params: nil, connection_string: nil)
    @connection_string_param = connection_string
    @params = params
    @options = {
      adapter: adapter,
      host: host,
      port: port,
      database: database,
      user: user,
      password: password,
    }

    extract_credentials if connection_string
  end

  def database
    @options[:database]
  end

  def adapter
    @options[:adapter]
  end

  def connection_string
    @connection_string_param ||= if @options[:user] != nil && @options[:database] != nil
        if @options[:port] != nil
          ("%{adapter}://%{user}:%{password}@%{host}:%{port}/%{database}" % @options)
        else
          ("%{adapter}://%{user}:%{password}@%{host}/%{database}" % @options)
        end
      else
        if @options[:port] != nil
          ("%{adapter}://@%{host}:%{port}/%{database}" % @options)
        else
          ("%{adapter}://@%{host}/%{database}" % @options)
        end
      end
  end

  def test_connection
    Sequel.connect(connection_string) {|db| db.test_connection}
  end

  def is_superuser
    Sequel.connect(connection_string) {|db|
      db.from(Sequel.lit("pg_user"))
        .select(Sequel.lit("usesuper"))
        .where(Sequel.lit("usename = CURRENT_USER"))
        .first[:usesuper]
    }
  end

  private
    def extract_credentials
      @options[:adapter], rest_connection = @connection_string_param.split('://')
      @options[:database], @params = rest_connection.split(/[:@\/]/).last.split('?')

      @options[:adapter] = case @options[:adapter]
        when "postgres"
          "postgresql"
        when "mysql"
          "mysql2"
        else
          @options[:adapter]
        end
    end
end
