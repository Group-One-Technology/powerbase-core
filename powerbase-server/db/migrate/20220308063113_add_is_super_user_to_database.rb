include SequelHelper

class AddIsSuperUserToDatabase < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_databases, :is_superuser, :boolean, :default => false, :null => false

    databases = PowerbaseDatabase.all
    databases.each do |db|
      validator = Databases::ConnectionValidator.new(connection_string: db.connection_string)
      db.update(is_superuser: validator.is_superuser)
    end
  end
end
