Rails.application.routes.draw do
  get '/auth/', to: 'users/auth#index'
  post '/refresh/', to: 'users/refresh#create'
  post '/login/', to: 'users/login#create'
  post '/logout/', to: 'users/login#destroy'
  post '/register/', to: 'users/register#create'

  resources :powerbase_databases, as: "databases", path: "databases", only: [:index, :show]
  post '/databases/connect', to: 'powerbase_databases#connect'

  get '/databases/:database_id/tables', to: 'powerbase_tables#index', as: 'database_tables'
  get '/tables/:id', to: 'powerbase_tables#show', as: 'database_table'
end
