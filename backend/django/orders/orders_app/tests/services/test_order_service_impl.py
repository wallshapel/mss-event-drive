# orders/orders_app/tests/services/test_order_service_impl.py
import pytest
from unittest.mock import MagicMock
from orders_app.services.order_service_impl import OrderServiceImpl
from orders_app.exceptions.app_exceptions import ServiceException
from orders_app.models import Order


@pytest.mark.django_db
class TestOrderServiceImpl:
    def setup_method(self):
        # Mock del repositorio inyectado
        self.repo = MagicMock()
        self.service = OrderServiceImpl(repository=self.repo)

    # ✅ 1. Debe crear una orden correctamente
    def test_create_order_success(self):
        mock_order = Order(id="uuid-123", description="New order", amount=10.0, status="PENDING")
        self.repo.save.return_value = mock_order

        data = {"description": "New order", "amount": 10.0}
        result = self.service.create_order(data)

        assert result == mock_order
        self.repo.save.assert_called_once()
        assert result.status == "PENDING"

    # ✅ 2. Debe propagar una ServiceException del repositorio
    def test_create_order_propagates_service_exception(self):
        self.repo.save.side_effect = ServiceException("DB error", status_code=500)
        data = {"description": "DB fail", "amount": 100.0}

        with pytest.raises(ServiceException) as exc_info:
            self.service.create_order(data)

        assert "DB error" in str(exc_info.value)

    # ✅ 3. Debe envolver excepciones genéricas en ServiceException 500
    def test_create_order_wraps_generic_exception(self):
        self.repo.save.side_effect = Exception("Unexpected error")
        data = {"description": "Test error", "amount": 50.0}

        with pytest.raises(ServiceException) as exc_info:
            self.service.create_order(data)

        assert "Error creating order" in str(exc_info.value)
        assert exc_info.value.status_code == 500
        
    # ✅ 4. Debe delegar correctamente la paginación al repositorio
    def test_get_orders_paginated_success(self):
        expected_result = {"results": [], "page": 1, "total_pages": 1}
        self.repo.find_paginated.return_value = expected_result

        result = self.service.get_orders_paginated(1, 5)

        self.repo.find_paginated.assert_called_once_with(1, 5)
        assert result == expected_result

    # ✅ 5. Debe envolver excepciones genéricas en ServiceException
    def test_get_orders_paginated_wraps_generic_exception(self):
        self.repo.find_paginated.side_effect = Exception("DB crash")

        with pytest.raises(ServiceException) as exc_info:
            self.service.get_orders_paginated(1, 5)

        assert "Error retrieving paginated orders" in str(exc_info.value)
        assert exc_info.value.status_code == 500

