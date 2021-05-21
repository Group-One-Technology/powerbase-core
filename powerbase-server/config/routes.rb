Rails.application.routes.draw do
  post '/refresh/', to: 'users/refresh#create'
  post '/login/', to: 'users/login#create'
  post '/logout/', to: 'users/logout#destroy'
  post '/register/', to: 'users/register#create'

  get '/databases/', to: 'powerbase_databases#index'
  post '/databases/connect', to: 'powerbase_databases#connect'

  get '/databases/:database_id/tables', to: 'powerbase_tables#index', as: 'database_tables'
end
