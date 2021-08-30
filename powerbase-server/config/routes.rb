Rails.application.routes.draw do
  get '/auth/', to: 'users/auth#index'
  post '/refresh/', to: 'users/refresh#create'
  post '/login/', to: 'users/login#create'
  post '/logout/', to: 'users/login#destroy'
  post '/register/', to: 'users/register#create'

  resources :powerbase_databases, as: "databases", path: "databases", only: [:index, :show], shallow: true do
    collection do
      post 'connect'
    end

    resources :powerbase_tables, path: 'tables', as: 'tables', only: [:index, :show], shallow: true do
      resources :table_views, path: 'views', as: 'views', only: [:index, :show, :update], shallow: true do
        member do
          get 'fields', to: 'view_field_options#index', as: 'view_fields'
        end
      end

      resources :table_foreign_keys, path: 'foreign_keys', as: 'foreign_keys', only: [:index], shallow: true

      member do
        get 'fields', to: 'powerbase_fields#index', as: 'table_fields'
        post 'records', to: 'table_records#index', as: 'table_records'
        post 'records_count', to: 'table_records#count', as: 'table_records_count'
      end
    end
  end

  post 'tables/:table_id/records/:id', to: 'table_records#show', as: 'table_record'
  get 'fields/:field_id/select_options', to: 'field_select_options#index', as: 'field_select_options'
end
