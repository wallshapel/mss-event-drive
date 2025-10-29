// src/services/impl/payment.service.impl.ts
import { PaymentService } from "../payment.service";
import { PaymentRepository } from "../../repositories/payment.repository";
import { PaymentInputDTO } from "../../dtos/payment-input.dto";
import { PaymentOutputDTO } from "../../dtos/payment-output.dto";
import { AppError } from "../../exceptions/app-error";
import { publishPaymentCompleted, PaymentCompletedEvent } from "../kafka.producer";

export class PaymentServiceImpl implements PaymentService {
  constructor(private readonly repository: PaymentRepository) {}

  private async validateOrderExists(orderId: string): Promise<void> {
    if (!orderId || orderId.length !== 36) {
      throw new AppError("Order ID is invalid or does not exist", 404);
    }
  }

  async createPayment(data: PaymentInputDTO): Promise<PaymentOutputDTO> {
    try {
      await this.validateOrderExists(data.orderId);

      const savedPayment = await this.repository.save({
        ...data,
        status: "APPROVED",
      });

      const event: PaymentCompletedEvent = {
        orderId: savedPayment.orderId,
        paymentId: savedPayment.id,
        amount: savedPayment.amount,
        status: savedPayment.status,
        occurredAt: new Date().toISOString(),
        source: "payments-ms",
        version: 1,
      };

      await publishPaymentCompleted(event);
      return savedPayment;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error creating payment: ${error.message}`, 500);
    }
  }

  async getPaymentById(id: string): Promise<PaymentOutputDTO> {
    try {
      const payment = await this.repository.findById(id);
      if (!payment) throw new AppError("Payment not found", 404);
      return payment;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error fetching payment: ${error.message}`, 500);
    }
  }
}
