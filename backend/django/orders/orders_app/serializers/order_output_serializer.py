# orders/orders_app/serializers/order_output_serializer.py
from rest_framework import serializers


class OrderOutputSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    description = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
