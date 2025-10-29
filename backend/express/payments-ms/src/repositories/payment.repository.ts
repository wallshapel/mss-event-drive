// src/repositories/payment.repository.ts
import { PaymentInputDTO } from "../dtos/payment-input.dto";
import { PaymentOutputDTO } from "../dtos/payment-output.dto";

export interface PaymentRepository {
  save(data: PaymentInputDTO): Promise<PaymentOutputDTO>;
  findById(id: string): Promise<PaymentOutputDTO | null>;
}
