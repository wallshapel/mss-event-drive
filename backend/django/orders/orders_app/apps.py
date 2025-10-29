# orders/orders_app/apps.py
from django.apps import AppConfig

class OrdersAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "orders_app"

    def ready(self):
        """
        Inyecta dependencias y arranca el consumidor Kafka.
        """
        # print("🚀 Django ejecutó OrdersAppConfig.ready()")  # 👈 diagnóstico
        from orders_app.controllers.order_controller import OrderController
        from orders_app.containers import Container
        from orders_app.services.kafka_consumer import start_payment_completed_consumer  # ✅ nuevo import

        # 🔧 Inyección de dependencias
        OrderController.order_service = Container.order_service()

        # 🔥 Arranca el consumidor Kafka en segundo plano
        start_payment_completed_consumer()
