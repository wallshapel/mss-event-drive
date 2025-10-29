import { PaymentService } from "./services/payment.service";
import { PaymentServiceImpl } from "./services/impl/payment.service.impl";
import { PaymentRepositoryImpl } from "./repositories/impl/payment.repository.impl";

export const container = {
  paymentService: (): PaymentService =>
    new PaymentServiceImpl(new PaymentRepositoryImpl()),
};
