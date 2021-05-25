class AddUserReferenceToDatabaseTable < ActiveRecord::Migration[6.1]
  def change
    add_reference :powerbase_databases, :user, foreign_key: true, null: false
  end
end
