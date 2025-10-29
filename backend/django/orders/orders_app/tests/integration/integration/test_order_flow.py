# orders/orders_app/tests/integration/test_order_flow.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from orders_app.models import Order


@pytest.mark.django_db
class TestOrderIntegration:
    endpoint = "/api/orders"

    def setup_method(self):
        self.client = APIClient()

    # ✅ 1. Crear una orden real y verificar que se guarda en la DB
    def test_full_order_creation_flow(self):
        payload = {"description": "Integration order", "amount": 75.5}

        # 1️⃣ Crear orden vía API
        response = self.client.post(self.endpoint, payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.data["data"]

        # 2️⃣ Verificar respuesta coherente
        assert data["description"] == "Integration order"
        assert float(data["amount"]) == 75.5
        assert data["status"] == "PENDING"

        # 3️⃣ Verificar en la base de datos
        db_order = Order.objects.get(id=data["id"])
        assert db_order.description == "Integration order"
        assert db_order.amount == 75.5
        assert db_order.status == "PENDING"

    # ✅ 2. Verificar validación completa del serializer
    def test_create_order_invalid_payload(self):
        payload = {"description": ""}  # Falta amount

        response = self.client.post(self.endpoint, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "amount" in str(response.data).lower()
        
    # ✅ 3. Debe devolver datos paginados reales desde el endpoint
    def test_get_orders_paginated_integration(self):
        # Crear 6 órdenes
        for i in range(6):
            payload = {"description": f"Paginated {i}", "amount": 10 + i}
            self.client.post(self.endpoint, payload, format="json")

        response = self.client.get(f"{self.endpoint}?page=1&page_size=5")

        assert response.status_code == status.HTTP_200_OK
        data = response.data["data"]

        assert "results" in data
        assert len(data["results"]) == 5
        assert data["page"] == 1
        assert data["page_size"] == 5
        assert data["total_items"] == 6
        assert data["total_pages"] == 2

