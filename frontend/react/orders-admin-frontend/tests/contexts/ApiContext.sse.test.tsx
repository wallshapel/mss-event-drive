import { describe, it, beforeEach, vi, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ApiProvider, useApi } from "../../src/contexts/ApiContext";

// 🧠 Mock de notistack
vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(),
}));

// 🧠 Mock de notify
vi.mock("../../src/utils/notify", () => ({
  notifyError: vi.fn(),
}));

// 🔹 Mock global de fetch
globalThis.fetch = vi.fn() as any;

// 🔹 Mock de EventSource (SSE)
let lastEventSourceInstance: any = null;

class MockEventSource {
  url: string;
  readyState: number;
  events: Record<string, Function[]>;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1;
    this.events = {};
    lastEventSourceInstance = this; // ✅ guardamos referencia global a la creada por el contexto
  }

  addEventListener(event: string, callback: Function) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    this.events[event] = (this.events[event] || []).filter((cb) => cb !== callback);
  }

  close() {
    this.readyState = 2;
  }

  emit(event: string, data: any) {
    const callbacks = this.events[event] || [];
    for (const cb of callbacks) cb({ data: JSON.stringify(data) });
  }
}

Object.defineProperty(globalThis, "EventSource", { value: MockEventSource });

describe("ApiContext - SSE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    lastEventSourceInstance = null;
  });

  it("debe agregar una notificación al recibir un evento SSE", async () => {
    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    // Esperar que el useEffect de ApiProvider se monte y cree EventSource
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
      lastEventSourceInstance.emit("notification", {
        message: "Order 12345 has been paid successfully ✅",
      });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].message).toContain("Order 12345");
  });

  it("debe actualizar el estado de una orden existente a PAID cuando llega evento SSE", async () => {
    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    // Inyectamos orden manualmente
    await act(async () => {
      (result.current as any).orders.push({
        id: "12345",
        description: "Order test",
        amount: 100,
        status: "PENDING",
        created_at: "2025-10-26",
      });

      await new Promise((r) => setTimeout(r, 10));
      lastEventSourceInstance.emit("notification", {
        message: "Order 12345 has been paid successfully ✅",
      });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.orders[0].status).toBe("PAID");
  });

  it("debe resaltar una orden nueva en highlightedOrders al recibir notificación SSE", async () => {
    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
      lastEventSourceInstance.emit("notification", {
        message: "Order abcde-123 has been paid successfully ✅",
      });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.highlightedOrders.has("abcde-123")).toBe(true);
  });
});
