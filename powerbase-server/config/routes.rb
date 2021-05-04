Rails.application.routes.draw do
  post '/groups/connect', to: 'groups#connect'

  get '/groups/tables', to: 'tables#index'
end
