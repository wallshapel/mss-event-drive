# orders/orders_app/services/order_service.py
from abc import ABC, abstractmethod
from typing import List
from orders_app.models import Order
import uuid 

class OrderService(ABC):
    @abstractmethod
    def create_order(self, data: dict) -> Order:
        """Create a new order in the system"""
        pass
    
    @abstractmethod
    def get_orders_paginated(self, page: int, page_size: int) -> dict:
        """Retrieve paginated orders"""
        pass
    
    @abstractmethod
    def get_order_by_id(self, order_id: uuid.UUID) -> Order:
        """Retrieve a single order by ID"""
        pass
