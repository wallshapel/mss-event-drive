// src/middleware/validation.middleware.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../dtos/api-response.dto";

export function validationMiddleware(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input = plainToInstance(type, req.body);
    const errors = await validate(input);

    if (errors.length > 0) {
      const messages = errors.map(err => Object.values(err.constraints || {})).flat();
      return res.status(400).json(ApiResponse.error("Validation failed", messages));
    }

    req.body = input;
    next();
  };
}
