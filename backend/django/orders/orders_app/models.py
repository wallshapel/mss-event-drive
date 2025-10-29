# orders/orders_app/models.py
import uuid
from django.db import models


class Order(models.Model):
    # Use UUID as the primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Example fields
    description = models.CharField(max_length=255)  # brief description of the order
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # order amount
    status = models.CharField(max_length=50, default="PENDING")  # PENDING, PAID, FAILED
    created_at = models.DateTimeField(auto_now_add=True)  # auto set on creation
    updated_at = models.DateTimeField(auto_now=True)  # auto update on save

    def __str__(self):
        return f"Order {self.id} - {self.status}"
