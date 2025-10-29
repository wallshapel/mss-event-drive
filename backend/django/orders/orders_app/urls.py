# orders/orders_app/urls.py
from django.urls import path
from orders_app.controllers.order_controller import OrderController

urlpatterns = [
    # 🔹 Paginación y creación de órdenes
    path("orders", OrderController.as_view(), name="orders_list_create"),

    # 🔹 Obtener orden por ID
    path("orders/<uuid:order_id>", OrderController.as_view(), name="order_detail"),
]
