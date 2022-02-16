
require 'sidekiq/web'
require 'sidekiq/cron/web'
Sidekiq::Web.use ActionDispatch::Cookies
Sidekiq::Web.use ActionDispatch::Session::CookieStore, key: "_interslice_session"

Rails.application.routes.draw do
  mount Sidekiq::Web => '/bg_admin' # TODO: Remove after test

  get '/auth/', to: 'users/auth#index'
  post '/refresh/', to: 'users/refresh#create'
  post '/login/', to: 'users/login#create'
  post '/logout/', to: 'users/login#destroy'
  post '/register/', to: 'users/register#create'

  resources :notifications, only: [:index], shallow: true do
    collection do
      put 'read'
    end
  end

  resources :powerbase_databases, as: "databases", path: "databases", except: [:create, :update], shallow: true do
    collection do
      post 'connect'
      post 'connect/hubspot', to: 'powerbase_databases#connect_hubspot'
    end

    member do
      get 'connection_stats'
      put 'general_info', as: 'update_database_general_info', to: 'powerbase_databases#update_general_info'
      put 'clear_logs'
      put 'update_database_permission', as: 'update_database_permission'
      put 'allowed_roles', as: 'update_allowed_roles', to: 'powerbase_databases#update_allowed_roles'
    end

    resources :base_connections, path: 'connections', as: 'connections', only: [:index, :create, :update, :destroy], shallow: true
    resources :guests, only: [:index, :create, :destroy], shallow: true do
      member do
        put 'change_access'
        put 'update_permissions'
        put 'update_database_permissions'
        put 'update_table_permissions'
        put 'update_field_permissions'
        put 'accept_invite'
        put 'reject_invite'
        delete 'leave_base'
      end

      collection do
        post 'invite_multiple_guests'
      end
    end

    resources :powerbase_tables, path: 'tables', as: 'tables', only: [:index, :show, :update, :create], shallow: true do
      resources :powerbase_fields, path: 'fields', as: 'fields', only: [:index, :create], shallow: true do
        member do
          put 'alias', as: 'update_field_alias'
          put 'options', as: 'update_field_options'
          put 'field_type', as: 'update_field_field_type'
          put 'set_as_pii', as: 'set_as_pii_field'
          put 'unset_as_pii', as: 'unset_as_pii_field'
          put 'update_field_permission', as: 'update_field_permission'
          put 'allowed_roles', as: 'update_allowed_roles', to: 'powerbase_fields#update_allowed_roles'
        end
      end

      resources :tasks do
        post :start
      end

      resources :table_views, path: 'views', as: 'views', except: [:new], shallow: true do
        collection do
          put 'order', to: 'table_views#update_order', as: 'update_views_order'
        end

        resources :view_field_options, path: 'view_fields', as: 'view_fields', only: [:index], shallow: true do
          collection do
            put 'order', to: 'view_field_options#update_order', as: 'reorder_view_fields'
            put 'hide_all', to: 'view_field_options#hide_all', as: 'hide_all_view_fields'
          end

          member do
            put 'resize', as: 'resize_view_field'
            put 'hide', as: 'hide_view_field'
            put 'unhide', as: 'unhide_view_field'
          end
        end
      end

      collection do
        put 'update', to: 'powerbase_tables#update_tables', as: 'update_tables'
      end

      member do
        get 'logs'
        put 'alias'
        put 'hide'
        delete 'drop'
        get 'fields', to: 'powerbase_fields#index', as: 'table_fields'
        post 'records', to: 'table_records#index', as: 'table_records'
        post 'linked_records', to: 'table_records#linked_records', as: 'table_linked_records'
        post 'records_count', to: 'table_records#count', as: 'table_records_count'
        put 'update_field_data', to: 'table_records#update_field_data'
        post 'add_record', to: 'table_records#add_record'
        put 'update_record', to: 'table_records#update_record'
        delete 'delete_record', to: 'table_records#delete_record'
        put 'update_default_view'
        put 'update_primary_keys'
        put 'update_table_permission', as: 'update_table_permission'
        put 'allowed_roles', as: 'update_allowed_roles', to: 'powerbase_tables#update_allowed_roles'
        post 'reindex_records'
      end
    end
  end

  resources :hubspot_databases, only: [:update], shallow: true
  resources :powerbase_field_types, path: 'field_types', as: 'field_types', only: [:index]

  get 'shared_databases', to: 'powerbase_databases#shared_databases'
  get 'base_invitations', to: 'guests#base_invitations'
  get 'auth/databases/:database_id/guest', to: 'users#guest'
  put 'auth/onboarded', to: 'users#onboarded'
  post '/guests/invite_sample_database', to: 'guests#invite_sample_database'
  post 'tables/:table_id/records/:id', to: 'table_records#show', as: 'table_record'
  post 'tables/virtual_tables', to: 'powerbase_tables#create_virtual_table', as: 'virtual_table'
  get 'tables/:table_id/connections', to: 'base_connections#table_connections', as: 'table_connections'
  get 'tables/:table_id/referenced_connections', to: 'base_connections#referenced_table_connections', as: 'table_referenced_connections'
  get 'fields/:field_id/select_options', to: 'field_select_options#index', as: 'field_select_options'
  post 'tables/:table_id/field', to: 'powerbase_fields#create', as: 'new_field'
  get 'tables/:id/fields/:name', to: 'powerbase_fields#get_single_field', as: 'get_single_field'
  post 'magic_records', to: 'table_records#create_magic_record', as: 'new_magic_records'
end
