defmodule CrudPhxWeb.Router do
  use CrudPhxWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", CrudPhxWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/reservation", PageController, :reservation
    get "/aboutus", PageController, :aboutus
    get "/menu", PageController, :menu
    get "/order/details", PageController, :order
    get "/order", PageController, :ordermenu
  end

  # Other scopes may use custom stacks.
  # scope "/api", CrudPhxWeb do
  #   pipe_through :api
  # end
end
