module Powerbase
  # The database connection.
  @@DB = nil

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
    user = "#{options[:username]}:#{options[:password]}"
    server = "#{options[:host]}:#{options[:port]}"

    @@connection_string = options[:connection_string] || "#{options[:adapter]}://#{user}@#{server}/#{options[:database]}"

    @@DB = Sequel.connect(@@connection_string)
    @@DB.extension :pg_enum if options[:adapter] === "postgresql"

    @@DB
  end

  # Returns the current database connection
  def self.DB
    if !@@DB || !@@DB&.test_connection
      raise StandardError.new("A database connection is needed to perform this action.")
    end

    @@DB
  end

  # Returns the current connection string
  def self.connection_string
    @@connection_string
  end

  # Returns a boolean whether the database has successfully connected
  def self.connected?
    @@DB.test_connection
  end
end