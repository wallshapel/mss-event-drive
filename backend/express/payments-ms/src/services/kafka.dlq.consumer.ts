// src/services/kafka.dlq.consumer.ts
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "payments-dlq-listener",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "payments-dlq-group" });

export async function startDLQConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "order_created_dlq", fromBeginning: true });

  console.log("☠️ DLQ consumer connected. Listening to 'order_created_dlq'...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      const value = message.value.toString();
      const errorReason = message.headers?.["x-error-reason"]?.toString();
      const origin = message.headers?.["x-origin-topic"]?.toString();
      const timestamp = message.headers?.["x-timestamp"]?.toString();

      console.warn(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💀 Dead Letter Message Received
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 Origin Topic: ${origin || topic}
📦 Payload: ${value}
⚠️ Error: ${errorReason || "Unknown"}
🕒 Timestamp: ${timestamp || "N/A"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    },
  });
}
