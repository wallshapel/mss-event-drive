# orders/orders_app/middleware/response_wrapper_middleware.py
from django.utils.deprecation import MiddlewareMixin
from rest_framework.response import Response
from orders_app.dtos.api_response import ApiResponse


class ResponseWrapperMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Solo envolver respuestas DRF (status < 500 y tipo Response)
        if isinstance(response, Response) and response.status_code < 500:
            if isinstance(response.data, dict) and "success" not in response.data:
                response.data = ApiResponse.success_response(
                    message=response.data.get("message", "Request successful"),
                    data=response.data.get("data", response.data),
                )
                # 👇 Forzar renderizado ANTES de devolverla
                response._is_rendered = False
                response.render()
        return response
