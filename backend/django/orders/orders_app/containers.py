# orders/orders_app/containers.py
from orders_app.services.order_service_impl import OrderServiceImpl
from orders_app.repositories.order_repository_impl import OrderRepositoryImpl


class Container:
    @staticmethod
    def order_service():
        # dependency inversion
        repo = OrderRepositoryImpl()
        return OrderServiceImpl(repository=repo)
