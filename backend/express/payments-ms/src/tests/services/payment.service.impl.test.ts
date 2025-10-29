// src/tests/services/payment.service.impl.test.ts
import { PaymentServiceImpl } from "../../services/impl/payment.service.impl";
import { PaymentRepository } from "../../repositories/payment.repository";
import { PaymentInputDTO } from "../../dtos/payment-input.dto";
import { AppError } from "../../exceptions/app-error";

// Mock del productor Kafka
jest.mock("../../services/kafka.producer", () => ({
  publishPaymentCompleted: jest.fn().mockResolvedValue(undefined),
}));

describe("PaymentServiceImpl", () => {
  let service: PaymentServiceImpl;
  let mockRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    service = new PaymentServiceImpl(mockRepository);
  });

  it("debe crear un pago exitosamente", async () => {
    const input: PaymentInputDTO = {
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 150.5,
      status: "PENDING",
    };

    const savedPayment = {
      id: "507f1f77bcf86cd799439011",
      orderId: input.orderId,
      amount: input.amount,
      status: "APPROVED" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.save.mockResolvedValue(savedPayment);

    const result = await service.createPayment(input);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(savedPayment);
  });

  it("debe lanzar error si el orderId es inválido", async () => {
    const input: PaymentInputDTO = {
      orderId: "123", // inválido
      amount: 100,
      status: "PENDING",
    };

    await expect(service.createPayment(input)).rejects.toThrow(AppError);
    await expect(service.createPayment(input)).rejects.toThrow("Order ID is invalid or does not exist");
  });

  it("debe retornar un pago por id", async () => {
    const fakePayment = {
      id: "507f1f77bcf86cd799439011",
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 99.99,
      status: "APPROVED" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findById.mockResolvedValue(fakePayment);

    const result = await service.getPaymentById(fakePayment.id);

    expect(result).toEqual(fakePayment);
    expect(mockRepository.findById).toHaveBeenCalledWith(fakePayment.id);
  });

  it("debe lanzar error si el pago no existe", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.getPaymentById("507f1f77bcf86cd799439011")).rejects.toThrow(AppError);
    await expect(service.getPaymentById("507f1f77bcf86cd799439011")).rejects.toThrow("Payment not found");
  });

  it("debe propagar AppError si ocurre un error interno", async () => {
    const input: PaymentInputDTO = {
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 100,
      status: "PENDING",
    };

    mockRepository.save.mockRejectedValue(new Error("Database error"));

    await expect(service.createPayment(input)).rejects.toThrow(AppError);
    await expect(service.createPayment(input)).rejects.toThrow("Error creating payment: Database error");
  });
});
