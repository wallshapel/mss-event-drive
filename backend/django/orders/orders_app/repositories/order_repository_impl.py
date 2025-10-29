# orders/orders_app/repositories/order_repository_impl.py
from orders_app.repositories.order_repository import OrderRepository
from orders_app.models import Order
from orders_app.exceptions.app_exceptions import ServiceException
from django.core.paginator import Paginator, EmptyPage
import uuid


class OrderRepositoryImpl(OrderRepository):
    def save(self, order: Order) -> Order:
        try:
            order.save()
            return order
        except Exception as e:
            raise ServiceException(f"Error saving order: {str(e)}", status_code=500)

    def find_by_id(self, order_id: uuid.UUID) -> Order:
        try:
            order = Order.objects.filter(id=order_id).first()
            if not order:
                raise ServiceException(f"Order {order_id} not found", status_code=404)
            return order
        except ServiceException:
            raise
        except Exception as e:
            raise ServiceException(f"Error retrieving order: {str(e)}", status_code=500)
        
    def find_paginated(self, page: int, page_size: int):
        try:
            orders_qs = Order.objects.all().order_by("-created_at")
            paginator = Paginator(orders_qs, page_size)
            try:
                paginated_page = paginator.page(page)
            except EmptyPage:
                paginated_page = paginator.page(paginator.num_pages)

            return {
                "results": list(paginated_page.object_list),
                "page": page,
                "page_size": page_size,
                "total_pages": paginator.num_pages,
                "total_items": paginator.count,
            }
        except Exception as e:
            raise ServiceException(f"Error retrieving paginated orders: {str(e)}", status_code=500)
