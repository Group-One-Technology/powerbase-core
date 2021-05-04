class GroupsController < ApplicationController
  schema(:connect) do
    optional(:host).value(:string)
    optional(:port).value(:integer)
    optional(:username).value(:string)
    optional(:password).value(:string)
    optional(:database).value(:string)
    optional(:connection_string).value(:string)
  end

  # POST /bases/connect
  def connect
    adapter = "postgres"
    user = "#{safe_params[:username]}:#{safe_params[:password]}"
    server = "#{safe_params[:host]}:#{safe_params[:port]}"
    connection_string = safe_params[:connection_string] ||
      "postgresql://#{user}@#{server}/#{safe_params[:database]}"

    @db = Powerbase.connect({ connection_string: connection_string })
    @group = nil

    if @db.test_connection
      @group = Group.find_by(name: safe_params[:database])

      if !@group
        @group = Group.new({
          name: safe_params[:database],
          connection_string: connection_string,
          database_type: adapter,
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
