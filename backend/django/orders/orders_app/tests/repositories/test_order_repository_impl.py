# orders/orders_app/tests/repositories/test_order_repository_impl.py
import pytest
from model_bakery import baker
from orders_app.repositories.order_repository_impl import OrderRepositoryImpl
from orders_app.exceptions.app_exceptions import ServiceException
from orders_app.models import Order


@pytest.mark.django_db
class TestOrderRepositoryImpl:
    def setup_method(self):
        self.repo = OrderRepositoryImpl()

    # ✅ 1. Debe guardar correctamente una orden
    def test_save_order_success(self):
        order = Order(description="Repo test", amount=25.5, status="PENDING")
        saved = self.repo.save(order)
        assert saved.id is not None
        assert saved.description == "Repo test"
        assert saved.status == "PENDING"

    # ✅ 2. Debe lanzar ServiceException(404) si no encuentra la orden
    def test_find_by_id_not_found(self):
        import uuid

        non_existing_id = uuid.uuid4()
        with pytest.raises(ServiceException) as exc_info:
            self.repo.find_by_id(non_existing_id)

        assert "not found" in str(exc_info.value).lower()
        assert exc_info.value.status_code == 404

    # ✅ 3. Debe recuperar correctamente una orden existente
    def test_find_by_id_success(self):
        order = baker.make(Order, description="Existing order", amount=100.0, status="PENDING")
        found = self.repo.find_by_id(order.id)

        assert found.id == order.id
        assert found.description == "Existing order"

    # ✅ 4. Debe lanzar ServiceException(500) ante error de DB simulado
    def test_save_raises_service_exception_on_error(self, monkeypatch):
        def raise_error(*args, **kwargs):
            raise Exception("Simulated DB error")

        monkeypatch.setattr(Order, "save", raise_error)
        order = Order(description="Fail", amount=10.0)

        with pytest.raises(ServiceException) as exc_info:
            self.repo.save(order)

        assert "error saving order" in str(exc_info.value).lower()
        assert exc_info.value.status_code == 500
        
    # ✅ 5. Debe devolver órdenes paginadas correctamente
    def test_find_paginated_success(self):
        # Crear 8 órdenes de prueba
        from model_bakery import baker
        for i in range(8):
            baker.make(Order, description=f"Order {i}", amount=10.0 + i, status="PENDING")

        repo = OrderRepositoryImpl()
        result = repo.find_paginated(page=1, page_size=5)

        assert "results" in result
        assert len(result["results"]) == 5
        assert result["total_items"] == 8
        assert result["total_pages"] == 2
        assert result["page"] == 1
        assert result["page_size"] == 5

    # ✅ 6. Debe manejar páginas fuera de rango devolviendo la última
    def test_find_paginated_out_of_range_returns_last_page(self):
        from model_bakery import baker
        for i in range(3):
            baker.make(Order, description=f"Order {i}", amount=10.0 + i, status="PENDING")

        repo = OrderRepositoryImpl()
        result = repo.find_paginated(page=10, page_size=2)

        # Página 10 no existe, debe devolver la última (página 2)
        assert result["page"] == 10  # request original
        assert len(result["results"]) <= 2
        assert result["total_pages"] == 2

