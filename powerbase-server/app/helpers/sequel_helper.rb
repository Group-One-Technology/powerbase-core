module SequelHelper

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
    table_select << Sequel.lit("oid") if adapter == :postgres
    table_select
  end
end