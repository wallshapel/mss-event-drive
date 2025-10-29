// src/tests/controllers/payment.controller.test.ts
import request from "supertest";
import express from "express";
import { createPaymentController } from "../../controllers/payment.controller";
import { PaymentService } from "../../services/payment.service";

describe("PaymentController (E2E - Supertest)", () => {
  let app: express.Application;
  let mockService: jest.Mocked<PaymentService>;

  beforeEach(() => {
    // ✅ mock del servicio
    mockService = {
      createPayment: jest.fn(),
      getPaymentById: jest.fn(),
    } as unknown as jest.Mocked<PaymentService>;

    // ✅ app temporal solo para test
    app = express();
    app.use(express.json());
    app.use("/api", createPaymentController(mockService));
  });

  it("POST /api/payments → debe retornar 201 al crear un pago válido", async () => {
    const fakePayment = {
      id: "507f1f77bcf86cd799439011",
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 100.5,
      status: "APPROVED" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockService.createPayment.mockResolvedValue(fakePayment);

    const payload = { orderId: fakePayment.orderId, amount: fakePayment.amount };

    const res = await request(app).post("/api/payments").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe(payload.orderId);
    expect(mockService.createPayment).toHaveBeenCalledTimes(1);
  });

  it("GET /api/payments/:id → debe retornar 200 al obtener un pago existente", async () => {
    const fakePayment = {
      id: "507f1f77bcf86cd799439011",
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 100.5,
      status: "APPROVED" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockService.getPaymentById.mockResolvedValue(fakePayment);

    const res = await request(app).get(`/api/payments/${fakePayment.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(fakePayment.id);
    expect(mockService.getPaymentById).toHaveBeenCalledTimes(1);
  });
});
