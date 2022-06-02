class PowerbaseDatabasesController < ApplicationController
  before_action :authorize_access_request!, except: [:connect_hubspot]
  before_action :authorize_acesss_hubspot, only: [:connect_hubspot]
  before_action :check_database_access, only: [:update_general_info, :update_credentials, :clear_logs]
  before_action :check_database_permission_access, only: [:update_allowed_roles, :update_database_permission]

  schema(:show, :credentials, :destroy, :clear_logs) do
    required(:id).value(:integer)
  end

  schema(:connection_stats) do
    required(:id).value(:integer)
    required(:filter).value(:string)
  end

  schema(:update_general_info) do
    required(:id).value(:integer)
    required(:name).value(:string)
    required(:color).value(:string)
    required(:enable_magic_data).value(:bool)
  end

  schema(:update_credentials) do
    required(:id).value(:integer)
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:user).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
  end

  schema(:create) do
    required(:name).value(:string)
    required(:adapter).value(:string)
    required(:is_turbo).value(:bool)
    required(:color).value(:string)
    required(:enable_magic_data).value(:bool)
  end

  schema(:connect) do
    optional(:name).value(:string)
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:adapter).value(:string)
    optional(:user).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:color).value(:string)
    optional(:is_turbo).value(:bool)
    optional(:connection_string).value(:string)
    optional(:enable_magic_data).value(:bool)
  end

  schema(:connect_hubspot) do
    required(:api_key).value(:string)
    required(:host).value(:string)
    required(:port).value(:integer)
    required(:user).value(:string)
    required(:password).value(:string)
    required(:database).value(:string)
    required(:database_size).value(:integer)
    required(:user_id).value(:integer)
  end

  schema(:update_database_permission) do
    required(:id).value(:integer)
    required(:permission)
    required(:access)
  end

  schema(:update_allowed_roles) do
    required(:id).value(:integer)
    required(:permission)
    required(:roles)
  end

  # GET /databases/
  def index
    @databases = PowerbaseDatabase.where(user_id: current_user.id)
    render json: @databases.map {|item| format_json(item)}
  end

  # GET /databases/:id/credentials
  def credentials
    @database = PowerbaseDatabase.find(safe_params[:id])
    raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
    current_user.can?(:manage_base, @database)
    render json: { connection_string: @database.connection_string }
  end

  # GET /shared_databases
  def shared_databases
    render json: current_user.shared_databases.map {|item| format_json(item)}
  end

  # GET /databases/:id
  def show
    @database = PowerbaseDatabase.find(safe_params[:id])
    raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
    current_user.can?(:view_base, @database)
    render json: format_json(@database)
  end

  # GET /databases/:id/connection_stats
  def connection_stats
    @database = PowerbaseDatabase.find(safe_params[:id])
    raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
    current_user.can?(:manage_base, @database)
    query = Databases::MetaQuery.new @database
    render json: query.connection_stats(filter: safe_params[:filter])
  end

  # PUT /databases/:id/general_info
  def update_general_info
    if safe_params[:name] != @database.name
      @database.name = safe_params[:name]
      existing_database = PowerbaseDatabase.find_by(name: safe_params[:name], user_id: current_user.id)

      if existing_database && existing_database.id != @database.id
        render json: { error: "Database with name of \"#{safe_params[:name]}\" already exists in this account." }, status: :unprocessable_entity
        return
      end
    end

    @database.color = safe_params[:color]
    @database.enable_magic_data = !!safe_params[:enable_magic_data]
    if @database.save
      render json: format_json(@database)
    else
      render json: @database.errors, status: :unprocessable_entity
    end
  end

  # PUT /databases/:id/credentials
  def update_credentials
    validator = Databases::ConnectionValidator.new(
      adapter: @database.adapter,
      host: safe_params[:host],
      port: safe_params[:port],
      user: safe_params[:user],
      password: safe_params[:password],
      database: safe_params[:database],
    )
    connection_string = validator.connection_string

    if connection_string == @database.connection_string
      render json: { error: "The database already use the same credentials in connection." }, status: :unprocessable_entity
      return
    end

    if !validator.test_connection
      render json: { error: "Failed to connect to #{@database.name} using the updated credentials. Please check the information given if they are correct." }, status: :unprocessable_entity
      return
    end

    @database.database_name = validator.database
    @database.connection_string = connection_strin

    if @database.save
      render json: format_json(@database)
    else
      render json: @database.errors, status: :unprocessable_entity
    end
  end

  # POST /databases/
  def create
    existing_database = PowerbaseDatabase.find_by(name: safe_params[:name], user_id: current_user.id)

    if existing_database
      render json: { error: "Database with name of \"#{safe_params[:name]}\" already exists in this account." }, status: :unprocessable_entity
      return
    end

    powerbase = Powerbase::Schema.new
    database_name, connection_string = powerbase.create_database

    database_creator = Databases::Creator.new({
      name: safe_params[:name],
      database_name: database_name,
      connection_string: connection_string,
      adapter: "postgresql",
      color: safe_params[:color],
      is_turbo: safe_params[:is_turbo],
      enable_magic_data: safe_params[:enable_magic_data],
      is_superuser: false,
      is_created: true,
      user_id: current_user.id,
    })

    if database_creator.save
      render json: { database: format_json(database_creator.database) }
    else
      render json: database_creator.errors, status: :unprocessable_entity
    end
  end

  # POST /databases/connect
  def connect
    existing_database = PowerbaseDatabase.find_by(name: safe_params[:name], user_id: current_user.id)

    if existing_database
      raise StandardError.new "Database with name of \"#{safe_params[:name]}\" already exists in this account."
    end

    validator = Databases::ConnectionValidator.new(
      adapter: safe_params[:adapter]&.strip,
      host: safe_params[:host]&.strip,
      port: safe_params[:port].to_i,
      user: safe_params[:user]&.strip,
      password: safe_params[:password],
      database: safe_params[:database]&.strip,
      connection_string: safe_params[:connection_string]&.strip,
    )
    connection_string = validator.connection_string
    is_superuser = validator.is_superuser

    if !validator.test_connection
      render json: { error: "Failed to connect to #{safe_params[:name]}. Please check the information given if they are correct." }, status: :unprocessable_entity
      return
    end

    if validator.adapter == "mysql2"
      render json: { error: "Couldn't connect to \"#{safe_params[:name]}\". MySQL databases are currently not supported yet." }, status: :unprocessable_entity
      return
    end

    database_creator = Databases::Creator.new({
      name: safe_params[:name],
      database_name: validator.database,
      connection_string: validator.connection_string,
      adapter: validator.adapter,
      color: safe_params[:color],
      is_turbo: safe_params[:is_turbo],
      enable_magic_data: safe_params[:enable_magic_data],
      is_created: false,
      is_superuser: validator.is_superuser,
      user_id: current_user.id,
    })

    if database_creator.save
      render json: { database: format_json(database_creator.database), db_size: database_creator.db_size }
    else
      render json: database_creator.errors, status: :unprocessable_entity
    end
  end

  # POST /databases/connect/hubspot
  def connect_hubspot
    validator = Databases::ConnectionValidator.new(
      adapter: "postgresql",
      host: safe_params[:host],
      port: safe_params[:port],
      user: safe_params[:user],
      password: safe_params[:password],
      database: safe_params[:database],
    )

    @hb_database = HubspotDatabase.new({
      name: safe_params[:database],
      connection_string: validator.connection_string,
      adapter: "postgresql",
      is_migrated: false,
      database_size: safe_params[:database_size],
      user_id: safe_params[:user_id],
    })

    if @hb_database.save
      render json: { id: @hb_database.id, name: @hb_database.name }
    else
      render json: @hb_database.errors, status: :unprocessable_entity
    end
  end

  # DELETE /databases/:id
  def destroy
    @database = PowerbaseDatabase.find(safe_params[:id])
    raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
    raise AccessDenied if !Guest.owner?(current_user.id, @database)

    if @database.is_created
      @database.drop
    else
      @database.remove
    end
    render status: :no_content
  end

  # PUT /databases/:id/clear_logs
  def clear_logs
    if @database.base_migration.update(logs: { errors: [] })
      render status: :no_content
    else
      render json: @database.base_migration.errors, status: :unprocessable_entity
    end
  end

  # PUT /databases/:id/allowed_roles
  def update_allowed_roles
    database_updater = Databases::Updater.new(@database)
    database_updater.update_allowed_roles!(safe_params[:permission], safe_params[:roles])

    render status: :no_content
  end

  # PUT /databases/:id/update_database_permission
  def update_database_permission
    database_updater = Databases::Updater.new(@database)
    database_updater.update_access!(safe_params[:permission], safe_params[:access])

    render status: :no_content
  end

  private
    def check_database_access
      @database = PowerbaseDatabase.find(safe_params[:id])
      raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
      current_user.can?(:manage_base, @database)
    end

    def check_database_permission_access
      @database = PowerbaseDatabase.find(safe_params[:id])
      raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
      current_user.can?(:change_guest_access, @database)
    end

    def authorize_acesss_hubspot
      if safe_params[:api_key] != ENV["HUBSPOT_API_KEY"]
        raise StandardError.new "Invalid Hubspot API Key. Access denied."
      end
    end

    def format_json(database)
      owner = database.user
      default_table = database.default_table(current_user)

      {
        id: database.id,
        user_id: database.user_id,
        adapter: database.adapter,
        name: database.name,
        database_name: database.database_name,
        description: database.description,
        owner: {
          user_id: owner.id,
          first_name: owner.first_name,
          last_name: owner.last_name,
          name: "#{owner.first_name} #{owner.last_name}",
          email: owner.email,
        },
        color: database.color,
        enable_magic_data: database.enable_magic_data,
        status: database.status,
        is_migrated: database.migrated?,
        is_turbo: database.is_turbo,
        is_created: database.is_created,
        is_superuser: database.is_superuser,
        default_table: if default_table
            {
              id: default_table.id,
              name: default_table.name,
              alias: default_table.alias,
              default_view_id: default_table.default_view_id,
            }
          else
            nil
          end,
        created_at: database.created_at,
        updated_at: database.updated_at,
        total_tables: database.powerbase_tables.length,
        total_collaborators: database.guests.length + 1,
        logs: database.base_migration.logs,
        permissions: database.permissions,
      }
    end
end
