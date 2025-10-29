// src/dtos/payment-output.dto.ts

export interface PaymentOutputDTO {
  id: string;
  orderId: string;
  amount: number;
  status: "APPROVED" | "REJECTED" | "PENDING";
  createdAt: Date;
  updatedAt: Date;
}
