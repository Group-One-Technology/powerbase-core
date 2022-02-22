class TableViews::Creator
  attr_accessor :table, :table_view

  def initialize(table)
    @table = table
    @base_migration = table.db.base_migration
    initialize_table_view!
  end

  def object
    table_view
  end

  def initialize_table_view!
    puts "#{Time.now} -- Saving table view table with id of #{table.id}..."
    @table_view = TableView.find_by(powerbase_table_id: table.id) || TableView.new
    table_view.powerbase_table_id = table.id
    table_view.name = "Default"
    table_view.view_type = "grid"
    table_view.creator_id = table.db.user_id
    table_view.order = 0
  end

  def save
    if table_view.save
      table.default_view_id = table_view.id
      table.save
    else
      @base_migration.logs["errors"].push({
        type: "Active Record",
        error: "Failed to save '#{table_view.name}' view",
        messages: table_view.errors.messages,
      })
      @base_migration.save
    end
  end
end