class BaseConnection::Creator
  attr_accessor :connection, :table

  def initialize(table, conn)
    @table = table
    @connection = BaseConnection.find_by(
      name: conn[:name],
      powerbase_table_id: @table.id,
      powerbase_database_id: @table.powerbase_database_id,
    ) || BaseConnection.new
    @connection.name = conn[:name]
    @connection.columns = conn[:columns]
    @connection.powerbase_table_id = @table.id
    @connection.powerbase_database_id = @table.powerbase_database_id
    @connection.referenced_columns = conn[:referenced_columns]
    @connection.referenced_table_id = conn[:referenced_table_id]
    @connection.referenced_database_id = conn[:referenced_database_id]
    @connection.is_constraint = conn[:is_constraint]
  end

  def save
    if !@connection.save
      @table.db.base_migration.write_error_logs!({
        type: "Active Record",
        error: "Failed to save '#{connection.name}' base connection",
        messages: connection.errors.messages,
      })
      false
    end
  end
end