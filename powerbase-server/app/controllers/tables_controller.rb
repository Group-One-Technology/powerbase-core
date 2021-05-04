class TablesController < ApplicationController
  before_action :check_connection

  # GET /bases/tables
  def index
    render json: { tables: Powerbase.DB.tables }
  end

  private
    def check_connection
      db = Powerbase.DB

      if !db || !db&.test_connection
        raise StandardError.new("A database connection is needed to perform this action.")
      end
    end
end
