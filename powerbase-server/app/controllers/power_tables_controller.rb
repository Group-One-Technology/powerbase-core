class PowerTablesController < ApplicationController
  schema(:index) do
    required(:group_id).value(:string)
  end

  before_action :set_group, only: [:index]

  # GET /groups/:group_id/tables
  def index
    render json: { tables: @group.power_tables }
  end

  private
    def set_group
      @group = Group.find(safe_params[:group_id])

      if !@group
        raise StandardError.new("Must establish a database connection first to execute this action.")
      end
    end
end
