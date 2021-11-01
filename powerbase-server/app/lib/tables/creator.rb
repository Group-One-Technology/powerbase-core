class Tables::Creator
  include SequelHelper

  attr_accessor :table_name, :order, :database, :table

  def initialize(table_name, order, database)
    @table_name = table_name
    @order = order
    @database = database
    @base_migration = database.base_migration
    initialize_new_table!
  end

  def initialize_new_table!
    @table = PowerbaseTable.find_by(
      name: table_name,
      powerbase_database_id: @database.id,
    ) || PowerbaseTable.new
    table.name = table_name
    table.alias = table_name.to_s.titlecase
    table.powerbase_database_id = database.id
    table.page_size = database.is_turbo ? DEFAULT_PAGE_SIZE_TURBO : DEFAULT_PAGE_SIZE
    table.order = order
  end
  
  def object
    table
  end

  def save
    if table.save
      table.inject_oid
      table.inject_notifier_trigger
    else
      base_migration.logs["errors"].push({
        type: "Active Record",
        error: "Failed to save '#{table_name}' table",
        messages: table.errors.messages,
      })
      base_migration.save
    end
  end

  def sync!
    table.sync!
  end
end