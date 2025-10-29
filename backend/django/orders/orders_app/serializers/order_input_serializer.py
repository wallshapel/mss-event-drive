# orders/orders_app/serializers/order_input_serializer.py
from rest_framework import serializers


class OrderInputSerializer(serializers.Serializer):
    description = serializers.CharField(
        max_length=255,
        required=True,
        allow_blank=False,
        error_messages={
            "blank": "Description cannot be blank",
            "required": "Description is required",
            "max_length": "Description must be at most 255 characters long",
        },
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True,
        error_messages={
            "required": "Amount is required",
            "invalid": "Amount must be a valid number",
        },
    )
