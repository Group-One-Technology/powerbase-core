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
    db = Powerbase.connect({
      adapter:  "postgres",
      host:     safe_params[:host],
      port:     safe_params[:port],
      user:     safe_params[:username],
      password: safe_params[:password],
      database: safe_params[:database],
      connection_string: safe_params[:connection_string],
    })

    render json: { connected: db.test_connection }
  end
end
