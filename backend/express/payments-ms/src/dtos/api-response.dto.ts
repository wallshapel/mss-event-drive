// src/dtos/api-response.dto.ts
export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  static success<T>(message: string, data?: T) {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message: string, data?: any) {
    return new ApiResponse(false, message, data);
  }
}
