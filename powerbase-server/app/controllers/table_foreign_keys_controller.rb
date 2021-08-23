class TableForeignKeysController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:table_id).value(:integer)
  end

  # GET /tables/:table_id/foreign_keys
  def index
    @foreign_keys = TableForeignKey.where(powerbase_table_id: safe_params[:table_id])
    render json: @foreign_keys.map {|item| format_json(item)}
  end

  private
    def format_json(foreign_key)
      {
        id: foreign_key.id,
        name: foreign_key.name,
        columns: foreign_key.columns,
        referenced_columns: foreign_key.referenced_columns,
        table_id: foreign_key.powerbase_table_id,
        referenced_table_id: foreign_key.referenced_table_id,
      }
    end
end
