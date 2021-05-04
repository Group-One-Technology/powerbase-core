class GroupsController < ApplicationController
  # POST /bases/connect
  def connect
    db = Powerbase.connect({
      adapter:  "postgres",
      host:     params[:host],
      port:     params[:port],
      user:     params[:username],
      password: params[:password],
      database: params[:database],
    })

    render json: { connected: db.test_connection }
  end
end
