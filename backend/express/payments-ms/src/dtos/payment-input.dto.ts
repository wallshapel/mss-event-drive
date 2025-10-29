// src/dtos/payment-input.dto.ts
import { IsNotEmpty, IsUUID, IsNumber, Min, IsOptional, IsEnum } from "class-validator";

export class PaymentInputDTO {
  @IsUUID("4", { message: "Order ID must be a valid UUID (v4)" })
  @IsNotEmpty({ message: "Order ID is required" })
  orderId!: string; // UUID generated in Orders.MS

  @IsNumber({}, { message: "Amount must be a number" })
  @Min(0.01, { message: "Amount must be greater than 0" })
  amount!: number;

  @IsOptional()
  @IsEnum(["APPROVED", "REJECTED", "PENDING"], { message: "Invalid payment status" })
  status?: "APPROVED" | "REJECTED" | "PENDING";
}
