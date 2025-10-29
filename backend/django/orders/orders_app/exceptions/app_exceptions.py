# orders/orders_app/exceptions/app_exceptions.py

class ServiceException(Exception):
    """Generic exception for service layer errors"""

    def __init__(self, message: str, status_code: int = 400, data: dict | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.data = data
