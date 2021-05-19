module Powerbase
  # The database connection.
  @@DB = nil

  # The adapter of the current connection.
  @@adapter = nil

  # The database name of the current connection.
  @@database = nil

  # A well-formed URI that is used to connect to the database.
  @@connection_string = nil

  # * Connect to a given database.
  # Accepts the following options:
  # :connection_string :: a well-formed URI that is used to connect to the database.
  # :adapter :: the adapter that is going to be used to connect to the databse.
  #                   It can be "postgresql". "mysql2", etc.
  # :host :: the url of the server in which the database is hosted.
  # :port :: the port that the database uses.
  # :user :: the username of a user that has access to the database.
  # :password :: the password of a user that has access to the database.
  # :database :: the name of the database to connect to.
  def self.connect(options)
    if options[:adapter] && options[:database]
      @@adapter = options[:adapter]
      @@database = options[:database]
      user = "#{options[:username]}:#{options[:password]}"
      server = "#{options[:host]}:#{options[:port]}"
      @@connection_string = "#{options[:adapter]}://#{user}@#{server}/#{options[:database]}"
    elsif options[:connection_string]
      @@connection_string = options[:connection_string]
      @@adapter, connection_string = options[:connection_string].split('://')
      @@database = options[:connection_string].split(/[:@\/]/).last
    else
      raise StandardError.new('Missing connection credentials to connect to Powerbase.')
    end

    @@DB = Sequel.connect(@@connection_string)
    @@DB.extension :pg_enum if options[:adapter] == "postgresql"

    @@DB
  end

  # Returns the current database connection
  def self.DB
    if !@@DB || !self.connected?
      raise StandardError.new("A database connection is needed to perform this action.")
    end

    @@DB
  end

  # Returns the current connection string.
  def self.connection_string
    @@connection_string
  end

  # Returns a boolean whether the database has successfully connected.
  def self.connected?
    @@DB.test_connection
  end

  # Returns the adapter of the current connection.
  def self.adapter
    @@adapter
  end

  # Returns the database of the current connection.
  def self.database
    @@database
  end
end