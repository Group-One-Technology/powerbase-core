module Powerbase
  # The database connection.
  @@DB = nil

  # The adapter of the current connection.
  @@adapter = nil

  # The database name of the current connection.
  @@database = nil

  # A well-formed URI that is used to connect to the database.
  @@connection_string = nil

  # Param options regarding the database connection.
  @@params = nil

  # Check whether the DB uses Powerbase Turbo.
  @@is_turbo = false

  mattr_accessor :database
  mattr_accessor :adapter
  mattr_accessor :connection_string
  mattr_accessor :is_turbo

  # * Connect to a given database.
  # Accepts the following options:
  # :is_turbo :: a boolean value that checks whether the DB is in Powerbase Turbo mode.
  # :connection_string :: a well-formed URI that is used to connect to the database.
  # :adapter :: the adapter that is going to be used to connect to the databse.
  #                   It can be "postgresql". "mysql2", etc.
  # :host :: the url of the server in which the database is hosted.
  # :port :: the port that the database uses.
  # :user :: the username of a user that has access to the database.
  # :password :: the password of a user that has access to the database.
  # :database :: the name of the database to connect to.
  def self.connect(options, &block)
    if options[:adapter] && options[:database]
      @@adapter = options[:adapter]
      @@database = options[:database]
      user = "#{options[:username]}:#{options[:password]}"
      server = "#{options[:host]}:#{options[:port]}"
      @@connection_string = "#{options[:adapter]}://#{user}@#{server}/#{options[:database]}"
    elsif options[:connection_string]
      @@connection_string = options[:connection_string]
      @@adapter, connection_string = options[:connection_string].split('://')
      @@database, @@params = options[:connection_string].split(/[:@\/]/).last.split('?')

      @@adapter = if @@adapter == "postgres"
          "postgresql"
        elsif @@adapter == "mysql"
          "mysql2"
        else
          @@adapter
        end
    else
      raise StandardError.new('Missing connection credentials to connect to Powerbase.')
    end

    @@is_turbo = options[:is_turbo]

    Sequel.extension :pg_enum if options[:adapter] == "postgresql"

    if block_given?
      Sequel.connect(@@connection_string, :keep_reference => false, &block)
    else
      @@DB = Sequel.connect(@@connection_string, :keep_reference => false)
      @@DB
    end
  end

  # Disconnects from the current database connection.
  def self.disconnect
    if !self.connected?
      raise StandardError.new("A database connection is needed to perform this action.")
    end

    @@DB.disconnect
  end

  # Returns the current database connection.
  def self.DB
    if !self.connected?
      raise StandardError.new("A database connection is needed to perform this action.")
    end

    @@DB
  end

  # Returns a boolean whether the database has successfully connected.
  def self.connected?
    !!@@DB && @@DB.test_connection
  end
end
