// src/controllers/payment.controller.ts
import { Request, Response, Router } from "express";
import { validationMiddleware } from "../middleware/validation.middleware";
import { PaymentInputDTO } from "../dtos/payment-input.dto";
import { ResponseFactory } from "../factory/response.factory";
import { PaymentService } from "../services/payment.service";

// ✅ Ahora exportamos una función que recibe el servicio inyectado
export function createPaymentController(service: PaymentService): Router {
  const router = Router();

  // POST /api/payments
  router.post(
    "/payments",
    validationMiddleware(PaymentInputDTO),
    async (req: Request, res: Response) => {
      try {
        const payment = await service.createPayment(req.body);
        return ResponseFactory.created(res, "Payment created successfully", payment);
      } catch (err) {
        return ResponseFactory.error(res, 500, "Failed to create payment", err);
      }
    }
  );

  // GET /api/payments/:id
  router.get("/payments/:id", async (req: Request, res: Response) => {
    try {
      const payment = await service.getPaymentById(req.params.id);
      return ResponseFactory.ok(res, "Payment fetched successfully", payment);
    } catch (err) {
      return ResponseFactory.error(res, 500, "Failed to fetch payment", err);
    }
  });

  return router;
}
