// src/tests/integration/payment.integration.test.ts
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Payment } from "../../models/payment.model";

describe("💾 Payment Integration Flow", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Payment.deleteMany({});
  });

  it("debe crear un pago exitosamente a través del endpoint real", async () => {
    const payload = {
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 150.5,
      status: "APPROVED",
    };

    const res = await request(app).post("/api/payments").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe(payload.orderId);

    // Verifica persistencia real en Mongo Memory
    const saved = await Payment.findOne({ orderId: payload.orderId });
    expect(saved).not.toBeNull();
    expect(saved?.amount).toBe(payload.amount);
  });

  it("debe obtener un pago existente desde la DB real", async () => {
    const payment = await Payment.create({
      orderId: "0a8e02f9-56a7-45ac-8b75-2fa2a6e09d55",
      amount: 200,
      status: "APPROVED",
    });

    const res = await request(app).get(`/api/payments/${payment._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(payment._id.toString());
    expect(res.body.data.amount).toBe(200);
  });

  it("debe retornar error 400 si falta el campo orderId", async () => {
    const res = await request(app).post("/api/payments").send({
      amount: 100,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });
});
