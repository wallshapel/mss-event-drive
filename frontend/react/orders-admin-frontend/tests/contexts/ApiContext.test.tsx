import { describe, it, beforeEach, vi, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

// 🔹 Mock de notistack (debe ir ANTES de importar el contexto)
vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(),
}));

// 🔹 Mock del módulo notify
vi.mock("../../src/utils/notify", () => ({
  notifyError: vi.fn(),
}));

import { ApiProvider, useApi } from "../../src/contexts/ApiContext";

// 🔹 Mock global de fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

// 🔹 Mock de EventSource (SSE)
class MockEventSource {
  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.events = {};
  }

  url: string;
  readyState: number;
  events: Record<string, Function[]>;

  addEventListener(event: string, callback: Function) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    this.events[event] = (this.events[event] || []).filter((cb) => cb !== callback);
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // 🔸 Método auxiliar para simular un mensaje SSE
  emit(event: string, data: any) {
    const callbacks = this.events[event] || [];
    for (const cb of callbacks) {
      cb({ data: JSON.stringify(data) });
    }
  }
}

Object.defineProperty(globalThis, "EventSource", { value: MockEventSource });

describe("ApiContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("debe cargar órdenes correctamente con refreshOrders()", async () => {
    const fakeData = {
      data: {
        results: [
          {
            id: "1",
            description: "Order 1",
            amount: 100,
            status: "PENDING",
            created_at: "2025-10-26",
          },
        ],
        page: 1,
        total_pages: 1,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeData,
    });

    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    await act(async () => {
      await result.current.refreshOrders(1);
    });

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].description).toBe("Order 1");
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it("debe mostrar error si refreshOrders falla", async () => {
    const { notifyError } = await import("../../src/utils/notify");

    mockFetch.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    await act(async () => {
      await result.current.refreshOrders(1);
    });

    expect(notifyError).toHaveBeenCalledWith("Error al cargar las órdenes");
  });

  it("debe crear una orden correctamente con createOrder()", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            results: [
              {
                id: "2",
                description: "New Order",
                amount: 50,
                status: "PENDING",
                created_at: "2025-10-26",
              },
            ],
            page: 1,
            total_pages: 1,
          },
        }),
      }); // refreshOrders

    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    await act(async () => {
      await result.current.createOrder("New Order", 50);
    });

    expect(result.current.orders[0].description).toBe("New Order");
  });
});
