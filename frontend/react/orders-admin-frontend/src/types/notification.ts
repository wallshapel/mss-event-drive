// src/types/notification.ts
export interface NotificationEvent {
  orderId: string;
  message: string;
  timestamp: string;
  channel: "EMAIL" | "SMS" | "PUSH";
}
