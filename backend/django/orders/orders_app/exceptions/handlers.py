# orders/orders_app/exceptions/handlers.py

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from orders_app.dtos.api_response import ApiResponse
from orders_app.exceptions.app_exceptions import ServiceException


def custom_exception_handler(exc, context):
    """
    Custom global exception handler that wraps errors
    in the unified ApiResponse format.
    """

    # Si la excepción es de DRF o de validación → usa el handler por defecto primero
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            ApiResponse.error_response(
                message=str(exc),
                data=response.data if isinstance(response.data, dict) else None,
            ),
            status=response.status_code,
        )

    # Si es nuestra excepción de servicio
    if isinstance(exc, ServiceException):
        return Response(
            ApiResponse.error_response(
                message=str(exc),
                data=exc.data,
            ),
            status=exc.status_code,
        )

    # Cualquier otra excepción no controlada → 500
    return Response(
        ApiResponse.error_response(
            message="Internal server error",
            data={"detail": str(exc)},
        ),
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
