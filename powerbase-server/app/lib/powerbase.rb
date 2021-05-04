module Powerbase
  # The database connection.
  @@DB = nil

  # * Connect to a given database.
  # Accepts the following options:
  # :connection_string :: a well-formed URI that is used to connect to the database.
  # :database_type :: the adapter that is going to be used to connect to the databse.
  #                   It can be "postgres". "sqlite", etc.
  # :host :: the url of the server in which the database is hosted.
  # :port :: the port that the database uses.
  # :user :: the username of a user that has access to the database.
  # :password :: the password of a user that has access to the database.
  # :database :: the name of the database to connect to.
  # TODO: Add options validator
  def self.connect(options)
    if options.has_key?(:connection_string) && options[:connection_string]
      @@DB = Sequel.connect(options[:connection_string])
    else
      @@DB = Sequel.connect(
        adapter:  options[:database_type] || "postgres",
        host:     options[:host],
        port:     options[:port],
        user:     options[:username],
        password: options[:password],
        database: options[:database]
      )
    end

    @@DB
  end

  # Returns the database connection
  def self.DB
    @@DB
  end
end