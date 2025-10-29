// src/repositories/impl/payment.repository.impl.ts
import { Payment } from "../../models/payment.model";
import { PaymentRepository } from "../payment.repository";
import { PaymentInputDTO } from "../../dtos/payment-input.dto";
import { PaymentOutputDTO } from "../../dtos/payment-output.dto";
import { AppError } from "../../exceptions/app-error";

export class PaymentRepositoryImpl implements PaymentRepository {
  async save(data: PaymentInputDTO): Promise<PaymentOutputDTO> {
    try {
      const payment = new Payment({
        orderId: data.orderId,
        amount: data.amount,
        status: data.status,
      });

      const saved = await payment.save();

      return {
        id: saved._id.toString(),
        orderId: saved.orderId,
        amount: saved.amount,
        status: saved.status,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
    } catch (error: any) {
      throw new AppError(`Error saving payment: ${error.message}`, 500);
    }
  }

  async findById(id: string): Promise<PaymentOutputDTO | null> {
    try {
      const payment = await Payment.findById(id);

      if (!payment) return null;

      return {
        id: payment._id.toString(),
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    } catch (error: any) {
      throw new AppError(`Error finding payment by id: ${error.message}`, 500);
    }
  }
}
