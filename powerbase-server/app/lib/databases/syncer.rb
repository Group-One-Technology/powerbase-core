include SequelHelper

class Databases::Syncer
  attr_accessor :powerbase_db, :powerbase_tables, :tables, :unmigrated_tables, :dropped_tables, :new_connection

  # Accepts the ff options:
  # - new_connection :: boolean - if the table syncer is called during a newly migrated database or not.
  # - tables :: symbol array - sequel tables
  def initialize(powerbase_db, new_connection: false, tables: nil)
    @powerbase_db = powerbase_db
    @new_connection = new_connection
    @powerbase_tables = @powerbase_db.tables

    begin
      @tables = tables || sequel_connect(@powerbase_db) {|db| db.tables}
    rescue Sequel::Error => ex
      puts ex.message
      if ex.message.include?("schema parsing returned no tables")
        @tables = []
      else
        raise ex
      end
    end

    @unmigrated_tables = @tables - powerbase_tables.map{|table| table.name.to_sym}
    @dropped_tables = powerbase_tables.map{|table| table.name.to_sym} - @tables
  end

  def in_synced?
    unmigrated_tables.empty? && dropped_tables.empty?
  end

  def sync!
    if unmigrated_tables.empty? && dropped_tables.empty?
      puts "#{Time.now} -- Database##{powerbase_db.id} is already in synced."
      powerbase_db.update_status!("migrated")
      return
    end

    if unmigrated_tables.count > 0
      puts "#{Time.now} -- Migrating #{unmigrated_tables.count} unmigrated tables"

      unmigrated_tables.each_with_index do |table_name, index|
        # Create powerbase table
        table_creator = Tables::Creator.new table_name, powerbase_db, order: index + 1
        table_creator.save
        powerbase_table = table_creator.object

        # Migrate columns async
        powerbase_table.sync!(new_connection: true)
      end
    end

    if dropped_tables.count > 0
      puts "#{Time.now} -- Migrating #{dropped_tables.count} dropped tables"
      deleted_tables = powerbase_tables.select{|table| dropped_tables.include?(table.name.to_sym)}
      deleted_tables.each(&:remove)
    end
  end
end
