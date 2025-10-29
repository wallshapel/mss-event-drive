// src/services/payment.service.ts
import { PaymentInputDTO } from "../dtos/payment-input.dto";
import { PaymentOutputDTO } from "../dtos/payment-output.dto";

export interface PaymentService {
  createPayment(data: PaymentInputDTO): Promise<PaymentOutputDTO>;
  getPaymentById(id: string): Promise<PaymentOutputDTO>;
}
