// src/server.ts
import mongoose from "mongoose";
import app from "./app"; // ✅ asegúrate de que app.ts exporte `export default app`
import "reflect-metadata";
import { startKafkaConsumer } from "./services/kafka.consumer";
import { startDLQConsumer } from "./services/kafka.dlq.consumer";
import { disconnectKafkaProducer } from "./services/kafka.producer"; // 👈 cierre limpio opcional

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://root:456@localhost:27017/payments_db?authSource=admin";

// Manejadores globales de error no atrapado
process.on("unhandledRejection", (reason) => {
  console.error("🚨 Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

async function startServer() {
  try {
    // 1️⃣ Conexión a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Iniciar consumidores Kafka
    await startKafkaConsumer();
    await startDLQConsumer();

    // 3️⃣ Iniciar servidor Express
    const server = app.listen(PORT, () => {
      console.log(`🚀 Payments.MS listening at http://localhost:${PORT}`);
    });

    // 4️⃣ Graceful shutdown
    const shutdown = async () => {
      console.log("\n👋 Shutting down Payments.MS...");
      await disconnectKafkaProducer().catch(console.error);
      await mongoose.connection.close();
      server.close(() => {
        console.log("✅ Server closed cleanly");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Failed to start Payments.MS:", err);
    process.exit(1);
  }
}

startServer();
