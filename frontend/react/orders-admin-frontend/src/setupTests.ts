import "@testing-library/jest-dom";
import { vi } from "vitest";

// 🧠 Mock global de notistack (para todos los tests)
vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(), // evita el error en imports
}));