# orders_app/services/order_service_impl.py
import uuid
from orders_app.services.order_service import OrderService
from orders_app.repositories.order_repository import OrderRepository
from orders_app.exceptions.app_exceptions import ServiceException
from orders_app.factories.order_factory import OrderFactory
# 👇 Añadir esta importación
from orders_app.services.kafka_producer import publish_order_created_event


class OrderServiceImpl(OrderService):
    def __init__(self, repository: OrderRepository):
        self.repository = repository

    def create_order(self, data: dict):
        try:
            new_order = OrderFactory.create(
                description=data["description"],
                amount=data["amount"],
            )

            saved_order = self.repository.save(new_order)

            # 🚀 Publicar evento Kafka
            publish_order_created_event(saved_order)

            return saved_order
        except ServiceException:
            raise
        except Exception as e:
            raise ServiceException(f"Error creating order: {str(e)}", status_code=500)
        
    def get_orders_paginated(self, page: int, page_size: int):
        try:
            return self.repository.find_paginated(page, page_size)
        except ServiceException:
            raise
        except Exception as e:
            raise ServiceException(f"Error retrieving paginated orders: {str(e)}", status_code=500)
        
    def get_order_by_id(self, order_id: uuid.UUID):
        try:
            return self.repository.find_by_id(order_id)
        except ServiceException:
            raise
        except Exception as e:
            raise ServiceException(f"Error retrieving order {order_id}: {str(e)}", status_code=500)

