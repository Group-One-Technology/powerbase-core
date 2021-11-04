module SequelHelper
  DEFAULT_PAGE_SIZE = 40
  DEFAULT_PAGE_SIZE_TURBO = 200

  def sequel_get_records(db, table_name)
    @db ||= db
    table = db.from(table_name.to_sym)
    table.select(*default_table_select)
  end

  def db
    @db
  end
  
  def default_table_select(adapter = @db.try(:adapter), has_row_oid_support = false)
    table_select = [ Sequel.lit("*") ]
    table_select << Sequel.lit("oid") if adapter.to_s.include?("postgres") && has_row_oid_support
    table_select
  end

  def new_db(connection_string)
    Sequel.connect(connection_string, max_connection: 100)
  end


  ## This can be use to query to db using sequel and automatically disconnect after getting the result
  # e.g.
  # database = PowerbaseDatabase.find(1)
  # records = sequel_connect(database) do |db|
  #  db.run("SELECT * FROM table_name")
  # end
  def sequel_connect(db)
    # Create db connection
    db = db._sequel(refresh: true)

    # Run block
    block_result = yield(db) if block_given?

    # Disconnect to db conn
    db.disconnect

    # return result
    block_result || db
  end
end