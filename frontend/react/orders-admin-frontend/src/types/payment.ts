// src/types/payment.ts
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: "APPROVED" | "REJECTED" | "PENDING";
  createdAt: string;
}
