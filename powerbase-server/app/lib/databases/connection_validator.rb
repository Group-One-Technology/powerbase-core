class Databases::ConnectionValidator
  def initialize(adapter: nil, host: nil, database: nil, user: nil, password: nil, connection_string: nil, params: nil)
    @connection_string_param = connection_string
    @params = params
    @options = {
      adapter: adapter,
      host: host,
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
        ("%{adapter}://%{user}:%{password}@%{host}/%{database}" % @options)
      else
        ("%{adapter}://@%{host}/%{database}" % @options)
      end
  end

  def test_connection
    Sequel.connect(connection_string) {|db| db.test_connection}
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
          @adapter
        end
    end
end
