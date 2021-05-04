Rails.application.routes.draw do
  get '/groups/', to: 'groups#index'
  post '/groups/connect', to: 'groups#connect'

  get '/groups/:group_id/tables', to: 'power_tables#index', as: 'group_tables'
end
