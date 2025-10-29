# orders/orders_app/factories/order_factory.py
import uuid
from orders_app.models import Order


class OrderFactory:
    """
    Factoría encargada de construir entidades Order.
    Facilita la extensión futura (e.g. distintos tipos de órdenes).
    """

    @staticmethod
    def create(description: str, amount: float) -> Order:
        return Order(
            id=uuid.uuid4(),
            description=description,
            amount=amount,
            status="PENDING",
        )
