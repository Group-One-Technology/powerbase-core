class GroupsController < ApplicationController
  schema(:connect) do
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:connection_string).value(:string)
  end

  # GET /groups/
  def index
    @groups = Group.all

    render json: @groups
  end

  # POST /groups/connect
  def connect
    options = safe_params.output
    options[:adapter] = "postgres"

    @db = Powerbase.connect(options)
    @group = nil

    if @db.test_connection
      @group = Group.find_by(name: options[:database])

      if !@group
        @group = Group.new({
          name: options[:database],
          connection_string: Powerbase.connection_string,
          database_type: options[:adapter],
          is_migrated: false,
        })

        if !@group.save
          render json: @group.errors, status: :unprocessable_entity
          return;
        end
      end
    end

    render json: { connected: @db.test_connection, group: @group }
  end
end
