# orders/orders_app/dtos/api_response.py
from typing import Any, Optional

class ApiResponse:
    @staticmethod
    def success_response(message: str, data: Optional[Any] = None) -> dict:
        return {
            "success": True,
            "message": message,
            "data": data,
        }

    @staticmethod
    def error_response(message: str, data: Optional[Any] = None) -> dict:
        return {
            "success": False,
            "message": message,
            "data": data,
        }

