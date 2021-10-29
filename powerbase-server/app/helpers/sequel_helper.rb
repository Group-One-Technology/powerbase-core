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
  
  def default_table_select(adapter = @db.try(:adapter))
    table_select = [ Sequel.lit("*") ]
    table_select << Sequel.lit("oid") if adapter.to_s.include?("postgres")
    table_select
  end

  def new_db(connection_string)
    Sequel.connect(connection_string, max_connection: 100)
  end

  def sequel_connect(db, &block)
    # Create db connection
    db = db._sequel(refresh: true)

    # Run block
    block_result = yield(db)

    # Disconnect to db conn
    db.disconnect

    # returl result
    block_result
  end
end