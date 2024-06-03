Rails.application.routes.draw do
  root "points#index"
  post "/", to: "points#create"
  resources :points, only: :show
end
