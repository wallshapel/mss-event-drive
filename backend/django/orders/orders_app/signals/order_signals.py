# orders_app/signals/order_signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from orders_app.models import Order
from orders_app.services.kafka_producer import publish_order_created_event

@receiver(post_save, sender=Order)
def order_created_handler(sender, instance, created, **kwargs):
    if not created:
        return

    # Publicar después del commit de la transacción
    transaction.on_commit(lambda: publish_order_created_event(instance))
