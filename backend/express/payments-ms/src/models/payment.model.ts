// src/models/payment.model.ts
import { Schema, model, Document, Types } from "mongoose";

// Payment document interface
export interface PaymentDocument extends Document {
  _id: Types.ObjectId;
  orderId: string;
  amount: number;
  status: "APPROVED" | "REJECTED" | "PENDING";
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const paymentSchema = new Schema<PaymentDocument>(
  {
    orderId: { type: String, required: true }, // UUID from Orders.MS
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["APPROVED", "REJECTED", "PENDING"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

// Export model
export const Payment = model<PaymentDocument>("Payment", paymentSchema);
