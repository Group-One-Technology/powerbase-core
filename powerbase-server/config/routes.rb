Rails.application.routes.draw do
  get '/databases/', to: 'powerbase_databases#index'
  post '/databases/connect', to: 'powerbase_databases#connect'

  get '/databases/tables', to: 'tables#index'
end
