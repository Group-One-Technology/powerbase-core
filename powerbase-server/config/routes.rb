Rails.application.routes.draw do
  post '/groups/connect', to: 'groups#connect'
end
