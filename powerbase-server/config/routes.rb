Rails.application.routes.draw do
  get '/databases/', to: 'powerbase_databases#index'
  post '/databases/connect', to: 'powerbase_databases#connect'

  get '/databases/:database_id/tables', to: 'powerbase_tables#index', as: 'database_tables'
end
