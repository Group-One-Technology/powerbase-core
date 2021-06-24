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
  get '/tables/:table_id/fields', to: 'powerbase_fields#index', as: 'table_fields'
  put '/tables/:table_id/records', to: 'table_records#index', as: 'table_records'

  get '/tables/:table_id/views', to: 'table_views#index', as: 'table_views'
  get '/views/:id', to: 'table_views#show', as: 'table_view'

  get '/views/:view_id/fields', to: 'view_field_options#index', as: 'view_fields'
end
