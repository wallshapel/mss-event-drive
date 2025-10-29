# orders/orders_ms/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("api/", include("orders_app.urls")),
]
