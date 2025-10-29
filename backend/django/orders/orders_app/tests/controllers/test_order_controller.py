# orders/orders_app/tests/controllers/test_order_controller.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock


@pytest.mark.django_db
class TestOrderController:
    endpoint = "/api/orders"

    def setup_method(self):
        self.client = APIClient()

    # ✅ 1. Debe retornar 201 al crear una orden válida
    @patch("orders_app.controllers.order_controller.OrderController.order_service")
    def test_create_order_success(self, mock_service):
        mock_order = MagicMock()
        mock_order.id = "123e4567-e89b-12d3-a456-426614174000"
        mock_order.description = "Test order"
        mock_order.amount = 100.50
        mock_order.status = "PENDING"
        mock_order.created_at = "2025-10-22T00:00:00Z"
        mock_service.create_order.return_value = mock_order

        payload = {"description": "Test order", "amount": 100.50}
        response = self.client.post(self.endpoint, payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["data"]["description"] == "Test order"
        assert mock_service.create_order.called

    # ✅ 2. Debe retornar error 400 si falta description
    def test_create_order_missing_description(self):
        payload = {"amount": 50.0}
        response = self.client.post(self.endpoint, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "description" in str(response.data["message"]).lower()

    # ✅ 3. Debe retornar error 400 si falta amount
    def test_create_order_missing_amount(self):
        payload = {"description": "No amount provided"}
        response = self.client.post(self.endpoint, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "amount" in str(response.data["message"]).lower()

    # ✅ 4. Debe verificar que se llame a OrderService.create_order con los datos correctos
    @patch("orders_app.controllers.order_controller.OrderController.order_service")
    def test_order_service_called_with_correct_data(self, mock_service):
        mock_order = MagicMock()
        mock_service.create_order.return_value = mock_order

        payload = {"description": "Verify service call", "amount": 150.0}
        self.client.post(self.endpoint, payload, format="json")

        mock_service.create_order.assert_called_once_with(payload)

    # ✅ 5. Debe devolver 200 y estructura de paginación válida
    @patch("orders_app.controllers.order_controller.OrderController.order_service")
    def test_get_orders_paginated_success(self, mock_service):
        mock_result = {
            "results": [
                MagicMock(id="1", description="A", amount=10.0, status="PENDING", created_at="2025-10-26T00:00:00Z")
            ],
            "page": 1,
            "page_size": 5,
            "total_pages": 1,
            "total_items": 1,
        }
        mock_service.get_orders_paginated.return_value = mock_result

        response = self.client.get(f"{self.endpoint}?page=1&page_size=5")

        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data["data"]
        assert "total_pages" in response.data["data"]
        assert mock_service.get_orders_paginated.called

        # ✅ 6. Debe devolver error 500 si ocurre excepción interna
        @patch("orders_app.controllers.order_controller.OrderController.order_service")
        def test_get_orders_paginated_error(self, mock_service):
            mock_service.get_orders_paginated.side_effect = Exception("DB down")

            response = self.client.get(f"{self.endpoint}?page=1&page_size=5")

            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert "error" in str(response.data["message"]).lower() or "down" in str(response.data).lower()
