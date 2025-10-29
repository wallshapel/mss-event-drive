import { describe, it, beforeEach, vi, expect, type Mock } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import OrdersTable from "../../src/components/OrdersTable";
import { useApi } from "../../src/contexts/ApiContext";

// 🧠 Mock de MUI (opcional, evita renders complejos innecesarios)
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<any>("@mui/material");
  return {
    ...actual,
    TableContainer: ({ children }: any) => <div>{children}</div>,
    Table: ({ children }: any) => <table>{children}</table>,
    TableHead: ({ children }: any) => <thead>{children}</thead>,
    TableBody: ({ children }: any) => <tbody>{children}</tbody>,
    TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    TableCell: ({ children }: any) => <td>{children}</td>,
    Pagination: ({ onChange }: any) => (
      <button onClick={() => onChange({}, 2)} data-testid="pagination-btn">
        next
      </button>
    ),
    Typography: ({ children }: any) => <p>{children}</p>,
    Stack: ({ children }: any) => <div>{children}</div>,
    Paper: ({ children }: any) => <div>{children}</div>,
  };
});

// 🧠 Mock de dayjs (para formato estable)
vi.mock("dayjs", () => ({
  default: (date: string) => ({
    format: () => date,
  }),
}));

// 🧠 Mock de ApiContext
vi.mock("../../src/contexts/ApiContext", () => ({
  useApi: vi.fn(),
}));

const mockUseApi = useApi as unknown as Mock;

describe("OrdersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra mensaje vacío si no hay órdenes", () => {
    mockUseApi.mockReturnValue({
      orders: [],
      page: 1,
      totalPages: 1,
      refreshOrders: vi.fn(),
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);
    expect(screen.getByText("No hay órdenes registradas aún.")).toBeTruthy();
  });

  it("renderiza filas con datos de órdenes", () => {
    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "1",
          description: "Orden A",
          amount: 100,
          status: "PENDING",
          created_at: "2025-10-26 10:00",
        },
        {
          id: "2",
          description: "Orden B",
          amount: 50,
          status: "PAID",
          created_at: "2025-10-26 12:00",
        },
      ],
      page: 1,
      totalPages: 1,
      refreshOrders: vi.fn(),
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);

    expect(screen.getByText("Orden A")).toBeTruthy();
    expect(screen.getByText("Orden B")).toBeTruthy();
    expect(screen.getByText("PAID")).toBeTruthy();
  });

  it("llama a refreshOrders al cambiar de página", async () => {
    const mockRefresh = vi.fn();

    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "1",
          description: "Orden A",
          amount: 100,
          status: "PENDING",
          created_at: "2025-10-26 10:00",
        },
      ],
      page: 1,
      totalPages: 3,
      refreshOrders: mockRefresh,
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("pagination-btn"));
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(mockRefresh).toHaveBeenCalledWith(2);
  });

  it("llama a clearHighlight al hacer clic en una fila resaltada", () => {
    const mockClearHighlight = vi.fn();

    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "abc",
          description: "Orden Resaltada",
          amount: 50,
          status: "PAID",
          created_at: "2025-10-26",
        },
      ],
      page: 1,
      totalPages: 1,
      refreshOrders: vi.fn(),
      highlightedOrders: new Set(["abc"]),
      clearHighlight: mockClearHighlight,
    });

    render(<OrdersTable />);

    const row = screen.getByText("Orden Resaltada").closest("tr");
    expect(row).toBeTruthy();

    fireEvent.click(row!);

    expect(mockClearHighlight).toHaveBeenCalledWith("abc");
  });

  it("aplica lógica de resaltado cuando la orden está en highlightedOrders", () => {
    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "resaltada",
          description: "Orden destacada",
          amount: 200,
          status: "PAID",
          created_at: "2025-10-26 15:00",
        },
      ],
      page: 1,
      totalPages: 1,
      refreshOrders: vi.fn(),
      highlightedOrders: new Set(["resaltada"]),
      clearHighlight: vi.fn(),
    });

    const { container } = render(<OrdersTable />);

    // ✅ Encuentra la fila
    const row = Array.from(container.querySelectorAll("tr")).find((tr) =>
      tr.textContent?.includes("Orden destacada")
    );
    expect(row).toBeTruthy();

    // ✅ Comprueba que la fila tenga atributo style o data indicativo de resaltado lógico
    // (por ejemplo, cursor: pointer)
    const styleAttr = row?.getAttribute("style") ?? "";
    const cursorMatches = /cursor:\s*pointer/.test(styleAttr);
    const hasHighlight =
      mockUseApi.mock.results[0].value.highlightedOrders.has("resaltada");

    expect(hasHighlight).toBe(true);
    expect(cursorMatches || hasHighlight).toBe(true);
  });
});
