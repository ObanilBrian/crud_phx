defmodule CrudPhxWeb.PageController do
  use CrudPhxWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def reservation(conn, _params) do
    render conn, "reservation.html"
  end

  def aboutus(conn, _params) do
    render conn, "aboutus.html"
  end

  def menu(conn, _params) do
    render conn, "menu.html"
  end

  def order(conn, _params) do
    render conn, "order.html"
  end

  def ordermenu(conn, _params) do
    render conn, "ordermenu.html"
  end
end

