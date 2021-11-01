class GuestsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:database_id)
    required(:email)
    required(:access)
    optional(:permissions)
  end

  schema(:create) do
    required(:database_id)
    required(:email)
    required(:access)
    optional(:permissions)
  end

  # GET /databases/:database_id/guests
  def index
    check_database_access(safe_params[:database_id])
    @guests = Guest.where(powerbase_database_id: safe_params[:database_id])
    render json: @guests.map {|item| user_format_json(item)}
  end

  # GET /shared_databases
  def shared_databases
    render json: current_user.shared_databases.map {|item| database_format_json(item)}
  end

  # POST /databases/:database_id/guests
  def create
    check_database_access(safe_params[:database_id], ["owner"])


    @user = User.find_by(email: safe_params[:email])

    if !@user
      render json: { error: "Could not find user with email of '#{safe_params[:email]}'." }, status: :unprocessable_entity
      return
    end

    if @user.id == current_user.id
      render json: { error: "User with email of '#{current_user.email}' already has access to the database with id of #{database_id}." }, status: :unprocessable_entity
      return
    end

    @guest = Guest.find_by(powerbase_database_id: safe_params[:database_id], user_id: @user.id)

    if @guest
      render json: { error: "User with email of '#{user.email}' is already a guest of this database." }, status: :unprocessable_entity
      return
    end

    @guest = Guest.new({
      user_id: @user.id,
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
        database_id: guest.powerbase_database_id,
      }
    end

    def user_format_json(guest)
      user = guest.user

      {
        id: guest.id,
        access: guest.access,
        permissions: guest.permissions,
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
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
