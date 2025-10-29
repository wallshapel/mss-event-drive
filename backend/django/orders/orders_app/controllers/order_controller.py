# orders/orders_app/controllers/order_controller.py
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from orders_app.serializers.order_input_serializer import OrderInputSerializer
from orders_app.serializers.order_output_serializer import OrderOutputSerializer
from orders_app.dtos.api_response import ApiResponse


class OrderController(APIView):
    order_service = None  # será inyectado en runtime

    # 🔹 Crear orden
    def post(self, request):
        serializer = OrderInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = self.order_service.create_order(serializer.validated_data)
        response_serializer = OrderOutputSerializer(order)

        return Response(
            {
                "success": True,
                "message": "Order created successfully",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    # 🔹 Obtener lista paginada o detalle por ID
    def get(self, request, order_id=None):
        try:
            if order_id:
                # ✅ order_id YA es uuid.UUID porque usas <uuid:order_id> en urls.py
                order_uuid = order_id if isinstance(order_id, uuid.UUID) else uuid.UUID(str(order_id))
                order = self.order_service.get_order_by_id(order_uuid)
                serializer = OrderOutputSerializer(order)

                return Response(
                    {
                        "success": True,
                        "message": f"Order {str(order_uuid)} retrieved successfully",
                        "data": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            # ✅ Si no hay order_id → lista paginada
            page = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("page_size", 5))

            result = self.order_service.get_orders_paginated(page, page_size)
            serializer = OrderOutputSerializer(result["results"], many=True)

            paginated_response = {
                "results": serializer.data,
                "page": result["page"],
                "page_size": result["page_size"],
                "total_pages": result["total_pages"],
                "total_items": result["total_items"],
            }

            return Response(
                {
                    "success": True,
                    "message": "Orders retrieved successfully",
                    "data": paginated_response,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                ApiResponse.error_response(str(e)),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
