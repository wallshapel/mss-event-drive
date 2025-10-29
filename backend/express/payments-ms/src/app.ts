// src/app.ts
import express, { Application } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { errorMiddleware } from "./exceptions/error.middleware";
import { createPaymentController } from "./controllers/payment.controller";
import { container } from "./container";

const app: Application = express();

// 🧱 Middlewares base
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// 🌐 Habilitar CORS
app.use(
  cors({
    origin: "http://localhost:4200", // frontend Angular
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight para cualquier ruta (Express 5 compatible)
app.options(/.*/, cors());

// ✅ Rutas
app.use("/api", createPaymentController(container.paymentService()));

// ✅ Middleware global de errores
app.use(errorMiddleware);

export default app;
