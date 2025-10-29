// src/types/order.ts
export interface Order {
  id: string;
  description: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  created_at: string;
}