# orders/orders_app/repositories/order_repository.py
from abc import ABC, abstractmethod
from orders_app.models import Order
import uuid


class OrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> Order:
        pass

    @abstractmethod
    def find_by_id(self, order_id: uuid.UUID) -> Order:
        """
        Debe devolver una entidad Order o lanzar excepción si no existe.
        """
        pass
    
    @abstractmethod
    def find_paginated(self, page: int, page_size: int) -> dict:
        """Devuelve un diccionario con los resultados paginados"""
        pass
