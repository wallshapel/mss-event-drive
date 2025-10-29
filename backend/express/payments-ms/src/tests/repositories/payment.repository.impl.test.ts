// src/tests/repositories/payment.repository.impl.test.ts
import { PaymentRepositoryImpl } from "../../repositories/impl/payment.repository.impl";
import { Payment } from "../../models/payment.model";

// Mock del modelo Payment (Mongoose)
jest.mock("../../models/payment.model");

describe("PaymentRepositoryImpl", () => {
  let repository: PaymentRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PaymentRepositoryImpl();
  });

  it("debe guardar un pago exitosamente", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 100,
      status: "APPROVED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Simula que el constructor de Payment devuelve un objeto con save()
    (Payment as any).mockImplementation(() => ({ save: mockSave }));

    const result = await repository.save({
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 100,
      status: "APPROVED",
    });

    expect(result.id).toBe("507f1f77bcf86cd799439011");
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("debe lanzar error si Mongoose falla al guardar", async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error("DB error"));
    (Payment as any).mockImplementation(() => ({ save: mockSave }));

    await expect(
      repository.save({
        orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
        amount: 99,
        status: "APPROVED",
      })
    ).rejects.toThrow("Error saving payment: DB error");
  });

  it("debe retornar un pago por id", async () => {
    const fakePayment = {
      _id: "507f1f77bcf86cd799439011",
      orderId: "c4c9254c-1ad9-4446-b028-7d46279857e8",
      amount: 99.99,
      status: "APPROVED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Payment.findById as jest.Mock).mockResolvedValue(fakePayment);

    const result = await repository.findById("507f1f77bcf86cd799439011");

    expect(result?.id).toBe(fakePayment._id);
    expect(result?.status).toBe("APPROVED");
    expect(Payment.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
  });

  it("debe retornar null si no existe el pago", async () => {
    (Payment.findById as jest.Mock).mockResolvedValue(null);

    const result = await repository.findById("9999");

    expect(result).toBeNull();
  });

  it("debe lanzar error si ocurre un fallo en findById", async () => {
    (Payment.findById as jest.Mock).mockRejectedValue(new Error("DB failure"));

    await expect(repository.findById("507f1f77bcf86cd799439011")).rejects.toThrow(
      "Error finding payment by id: DB failure"
    );
  });
});
