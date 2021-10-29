class GuestsController < ApplicationController
  before_action :authorize_access_request!

  schema(:create) do
    required(:database_id)
    required(:user_id)
    required(:access)
    optional(:permissions)
  end

  # GET /shared_databases
  def shared_databases
    render json: current_user.shared_databases.map {|item| database_format_json(item)}
  end

  # POST /databases/:database_id/guests
  def create
    check_database_access(safe_params[:database_id], safe_params[:user_id])

    if safe_params[:user_id] == current_user.id
      render json: { error: "User with email of '#{current_user.email}' already has access to the database with id of #{database_id}." }, status: :unprocessable_entity
      return
    end

    @guest = Guest.new({
      user_id: safe_params[:user_id],
      powerbase_database_id: safe_params[:database_id],
      access: safe_params[:access],
      permissions: safe_params[:permissions],
    })

    if @guest.save
      render json: format_json(@guest), status: :created
    else
      render json: @guest.errors, status: :unprocessable_entity
    end
  end

  private
    def format_json(guest)
      {
        id: guest.id,
        access: guest.access,
        permissions: guest.permissions,
        user_id: guest.user_id,
        user: guest.user,
        database_id: guest.powerbase_database_id,
        database: guest.powerbase_database,
      }
    end

    def database_format_json(database)
      {
        id: database.id,
        user_id: database.user_id,
        adapter: database.adapter,
        name: database.name,
        database_name: database.database_name,
        description: database.description,
        color: database.color,
        is_migrated: database.is_migrated,
        is_turbo: database.is_turbo,
        created_at: database.created_at,
        updated_at: database.updated_at,
        total_tables: database.powerbase_tables.length,
        logs: database.base_migration.logs,
      }
    end
end
