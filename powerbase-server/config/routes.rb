Rails.application.routes.draw do
  get '/groups/', to: 'groups#index'
  post '/groups/connect', to: 'groups#connect'

  get '/groups/tables', to: 'tables#index'
end
