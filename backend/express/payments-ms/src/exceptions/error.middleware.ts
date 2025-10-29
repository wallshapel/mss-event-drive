// src/exceptions/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "./app-error";
import { ResponseFactory } from "../factory/response.factory";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("❌ Error:", err);

  if (err instanceof AppError) {
    return ResponseFactory.error(res, err.status, err.message, err.data);
  }

  // Errores inesperados
  return ResponseFactory.error(res, 500, "Internal Server Error", err.message || null);
}
