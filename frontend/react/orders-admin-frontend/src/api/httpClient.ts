// src/api/httpClient.ts
import axios from "axios";

export const httpClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

// ✅ Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    console.log("➡️ Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.warn("⚠️ Timeout, retrying once...");
      return httpClient.request(error.config);
    }
    if (!error.response) {
      console.error("❌ Network error:", error.message);
      alert("Error de conexión con el servidor.");
    } else {
      console.error("❌ API error:", error.response.data);
    }
    return Promise.reject(error);
  }
);
