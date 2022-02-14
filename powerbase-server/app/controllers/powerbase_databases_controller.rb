class PowerbaseDatabasesController < ApplicationController
  before_action :authorize_access_request!, except: [:connect_hubspot]
  before_action :authorize_acesss_hubspot, only: [:connect_hubspot]
  before_action :check_database_access, only: [:update, :clear_logs]
  before_action :check_database_permission_access, only: [:update_allowed_roles, :update_database_permission]

  schema(:show, :active_connections, :destroy, :clear_logs) do
    required(:id).value(:integer)
  end

  schema(:update) do
    required(:id).value(:integer)
    required(:name).value(:string)
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    required(:color).value(:string)
  end

  schema(:connect) do
    optional(:name).value(:string)
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:adapter).value(:string)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:color).value(:string)
    optional(:is_turbo).value(:bool)
    optional(:connection_string).value(:string)
  end

  schema(:connect_hubspot) do
    required(:api_key).value(:string)
    required(:host).value(:string)
    required(:port).value(:integer)
    required(:username).value(:string)
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

  # GET /databases/:id/active_connections
  def active_connections
    @database = PowerbaseDatabase.find(safe_params[:id])
    raise NotFound.new("Could not find database with id of #{safe_params[:id]}") if !@database
    current_user.can?(:manage_base, @database)
    query = Databases::MetaQuery.new @database
    render json: { result: query.active_connections }
  end

  # PUT /databases/:id
  def update
    options = safe_params.output
    options[:adapter] = @database.adapter
    options[:is_turbo] = @database.is_turbo
    is_connection_updated = false

    if options[:name] != @database.name
      @database.name = options[:name]
      @existing_database = PowerbaseDatabase.find_by(name: options[:name], user_id: current_user.id)

      if @existing_database && @existing_database.id != @database.id
        render json: { is_existing: true, database: format_json(@database) }
        return
      end
    end

    if options[:username]&.length > 1 && options[:password]&.length > 1
      is_connection_updated = true

      begin
        Powerbase.connect(options)
      rescue => exception
        render json: { connected: false, exception: exception }
        return
      end

      if !Powerbase.connected?
        Powerbase.disconnect
        render json: { connected: false, database: format_json(@database) }
        return
      end
    end

    @database.database_name = options[:database]
    @database.color = options[:color]
    @database.connection_string = Powerbase.connection_string if is_connection_updated
    if !@database.save
      Powerbase.disconnect if is_connection_updated
      render json: @database.errors, status: :unprocessable_entity
      return;
    end

    Powerbase.disconnect if is_connection_updated
    render json: { connected: true, database: format_json(@database) }
  end

  # POST /databases/connect
  def connect
    options = safe_params.output
    @database = PowerbaseDatabase.find_by(name: options[:name], user_id: current_user.id)

    if @database
      render json: { error: "Database with name of '#{options[:name]}' already exists in this account." }, status: :unprocessable_entity
      return
    end

    begin
      Powerbase.connect(options)
    rescue => exception
      render json: { error: "Couldn't connect to \"#{options[:name]}\". Please check the information given if they are correct." }, status: :unprocessable_entity
      return;
    end

    options[:database_name] = Powerbase.database
    options[:connection_string] = Powerbase.connection_string
    options[:adapter] = Powerbase.adapter
    is_connected = Powerbase.connected?
    Powerbase.disconnect

    if !is_connected
      render json: { error: "Couldn't connect to \"#{options[:name]}\". Please check the information given if they are correct." }, status: :unprocessable_entity
      return
    end

    if options[:adapter] == "mysql2"
      render json: { error: "Couldn't connect to \"#{options[:name]}\". MySQL databases are currently not supported yet." }, status: :unprocessable_entity
      return
    end

    database_creator = Databases::Creator.new({
      name: options[:name],
      database_name: options[:database_name],
      connection_string: options[:connection_string],
      adapter: options[:adapter],
      color: options[:color],
      is_turbo: options[:is_turbo],
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
    @hb_database = HubspotDatabase.new({
      name: safe_params[:database],
      connection_string: Powerbase.connection_string({
        adapter: "postgresql",
        host: safe_params[:host],
        port: safe_params[:port],
        user: safe_params[:username],
        password: safe_params[:password],
        database: safe_params[:database],
      }),
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
    @database.remove
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
      if safe_params[:api_key] != ENV["hubspot_api_key"]
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
        status: database.status,
        is_migrated: database.migrated?,
        is_turbo: database.is_turbo,
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
