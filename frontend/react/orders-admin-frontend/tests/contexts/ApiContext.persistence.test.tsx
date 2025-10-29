import { describe, it, beforeEach, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { ApiProvider, useApi } from "../../src/contexts/ApiContext";

// 🔹 Mock de notistack y notify (no los necesitamos aquí, pero evita errores)
vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(),
}));
vi.mock("../../src/utils/notify", () => ({
  notifyError: vi.fn(),
}));

// 🔹 Mock de fetch (no se usa directamente, pero ApiContext lo espera)
globalThis.fetch = vi.fn() as any;

// 🔹 Mock de localStorage
const store: Record<string, string> = {};
globalThis.localStorage = {
  getItem: vi.fn((key) => store[key] || null),
  setItem: vi.fn((key, val) => {
    store[key] = val;
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(store)) delete store[key];
  }),
} as any;

// 🔹 Mock de EventSource
class MockEventSource {
  constructor(url: string) {
    this.url = url;
    this.events = {};
  }
  url: string;
  events: Record<string, Function[]>;
  addEventListener(event: string, callback: Function) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  close() {}
}
Object.defineProperty(globalThis, "EventSource", { value: MockEventSource });

describe("ApiContext - persistencia local", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("guarda y carga correctamente los estados de órdenes", async () => {
    // Simular un guardado manual
    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    const fakeHighlighted = new Set(["1", "2"]);
    const fakeRead = new Set(["3"]);

    act(() => {
      // Llamamos la función privada a través de su efecto indirecto
      localStorage.setItem(
        "orderStates",
        JSON.stringify({
          highlighted: [...fakeHighlighted],
          read: [...fakeRead],
        })
      );
    });

    // Re-renderizar el contexto para forzar carga desde localStorage
    const { result: newResult } = renderHook(() => useApi(), {
      wrapper: ApiProvider,
    });

    // Esperamos que los datos cargados estén en el contexto
    expect(newResult.current.highlightedOrders instanceof Set).toBe(true);
    expect([...newResult.current.highlightedOrders]).toEqual(["1", "2"]);
  });

  it("clearHighlight() elimina el ID de highlightedOrders y lo agrega a readOrders", async () => {
    // Pre-cargar el estado
    localStorage.setItem(
      "orderStates",
      JSON.stringify({ highlighted: ["1"], read: [] })
    );

    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    await act(async () => {
      result.current.clearHighlight("1");
    });

    const saved = JSON.parse(localStorage.getItem("orderStates")!);
    expect(saved.highlighted).toEqual([]);
    expect(saved.read).toEqual(["1"]);
  });

  it("clearHighlight() no rompe si el ID no existe", async () => {
    localStorage.setItem(
      "orderStates",
      JSON.stringify({ highlighted: ["1"], read: [] })
    );

    const { result } = renderHook(() => useApi(), { wrapper: ApiProvider });

    await act(async () => {
      result.current.clearHighlight("999"); // no existe
    });

    const saved = JSON.parse(localStorage.getItem("orderStates")!);
    expect(saved.highlighted).toEqual(["1"]); // se mantiene igual
    expect(saved.read).toEqual(["999"]); // se marca como leída incluso si no estaba resaltada
  });
});
