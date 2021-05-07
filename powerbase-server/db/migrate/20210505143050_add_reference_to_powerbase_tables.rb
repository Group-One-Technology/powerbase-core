class AddReferenceToPowerbaseTables < ActiveRecord::Migration[6.1]
  def change
    add_foreign_key :powerbase_tables, :powerbase_databases
  end
end
