Rails.application.routes.draw do
  get '/auth/', to: 'users/auth#index'
  post '/refresh/', to: 'users/refresh#create'
  post '/login/', to: 'users/login#create'
  post '/logout/', to: 'users/login#destroy'
  post '/register/', to: 'users/register#create'

  resources :powerbase_databases, as: "databases", path: "databases", only: [:index, :show, :update], shallow: true do
    collection do
      post 'connect'
    end

    member do
      put 'clear_logs'
    end

    resources :base_connections, path: 'connections', as: 'connections', only: [:index, :create, :update, :destroy], shallow: true

    resources :powerbase_tables, path: 'tables', as: 'tables', only: [:index, :show, :update], shallow: true do
      resources :table_views, path: 'views', as: 'views', except: [:new], shallow: true do
        member do
          get 'fields', to: 'view_field_options#index', as: 'view_fields'
        end
      end

      member do
        get 'fields', to: 'powerbase_fields#index', as: 'table_fields'
        post 'records', to: 'table_records#index', as: 'table_records'
        post 'linked_records', to: 'table_records#linked_records', as: 'table_linked_records'
        post 'records_count', to: 'table_records#count', as: 'table_records_count'
        put 'update_default_view'
      end
    end
  end

  resources :powerbase_field_types, path: 'field_types', as: 'field_types', only: [:index]

  post 'tables/:table_id/records/:id', to: 'table_records#show', as: 'table_record'
  get 'tables/:table_id/connections', to: 'base_connections#table_connections', as: 'table_connections'
  get 'tables/:table_id/referenced_connections', to: 'base_connections#referenced_table_connections', as: 'table_referenced_connections'
  put 'tables/update/aliases', to: 'powerbase_tables#update_aliases', as: 'update_tables_aliases'
  get 'fields/:field_id/select_options', to: 'field_select_options#index', as: 'field_select_options'
  put 'fields/:view_field_id/resize', to: 'view_field_options#update_column_size', as: 'update_field'
end
