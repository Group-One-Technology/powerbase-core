class PowerbaseDatabaseSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :adapter, :name, :database_name, :description,
             :color, :is_migrated, :is_turbo, :created_at, :updated_at,


  # {
  #   id: database.id,
  #   user_id: database.user_id,
  #   adapter: database.adapter,
  #   name: database.name,
  #   database_name: database.database_name,
  #   description: database.description,
  #   color: database.color,
  #   is_migrated: database.is_migrated,
  #   is_turbo: database.is_turbo,
  #   created_at: database.created_at,
  #   updated_at: database.updated_at,
  #   total_tables: database.powerbase_tables.length,
  #   logs: database.base_migration.logs
  # }
end
