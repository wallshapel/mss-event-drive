// src/factory/response.factory.ts
import { Response } from "express";
import { ApiResponse } from "../dtos/api-response.dto";

export class ResponseFactory {
  static created<T>(res: Response, message: string, data: T) {
    return res.status(201).json(ApiResponse.success(message, data));
  }

  static ok<T>(res: Response, message: string, data: T) {
    return res.status(200).json(ApiResponse.success(message, data));
  }

  static error<T>(res: Response, statusCode: number, message: string, data?: T) {
    return res.status(statusCode).json(ApiResponse.error(message, data ?? null));
  }
}
