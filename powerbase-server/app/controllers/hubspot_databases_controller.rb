class HubspotDatabasesController < ApplicationController
  before_action :authorize_acesss_hubspot
  before_action :set_hb_database

  schema(:update) do
    required(:id).value(:integer)
    required(:api_key).value(:string)
    required(:is_migrated).value(:bool)
    required(:start_time).value(:string)
    required(:end_time).value(:string)
  end

  # PUT /hubspot_databases/:id/update
  def update
    if @hb_database.update(
      is_migrated: safe_params[:is_migrated],
      start_time: safe_params[:start_time],
      end_time: safe_params[:end_time],
    )
      render json: format_json(@hb_database)
    else
      render json: @hb_database.errors, status: :unprocessable_entity
    end
  end

  private
    def authorize_acesss_hubspot
      if safe_params[:api_key] != ENV["HUBSPOT_API_KEY"]
        raise StandardError.new "Invalid Hubspot API Key. Access denied."
      end
    end

    def set_hb_database
      @hb_database = HubspotDatabase.find(safe_params[:id])
    end

    def format_json(hb_database)
      {
        id: hb_database.id,
        name: hb_database.name,
        user_id: hb_database.user_id,
        database_id: hb_database.powerbase_database_id,
        is_migrated: hb_database.is_migrated,
        created_at: hb_database.created_at,
        updated_at: hb_database.updated_at,
      }
    end
end
