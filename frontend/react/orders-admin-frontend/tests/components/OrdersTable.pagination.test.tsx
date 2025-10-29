import { describe, beforeEach, it, expect, vi, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OrdersTable from "../../src/components/OrdersTable";
import { useApi } from "../../src/contexts/ApiContext";

// 🚀 Mock global para notistack
vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(),
}));

vi.mock("../../src/contexts/ApiContext");

const mockUseApi = useApi as unknown as Mock;

describe("OrdersTable - Paginación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el componente de paginación con la página y total correctos", () => {
    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "1",
          description: "Test order",
          amount: 100,
          status: "PENDING",
          created_at: "2025-10-26 10:00",
        },
      ],
      page: 2,
      totalPages: 5,
      refreshOrders: vi.fn(),
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);

    const paginator = screen.getByRole("button", { name: /page 2/i });
    expect(paginator).toBeInTheDocument();

    // Verifica que se renderizan los botones de paginación esperados
    expect(screen.getByRole("button", { name: "Go to page 1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to page 5" })).toBeTruthy();
  });

  it("llama a refreshOrders con el número correcto al cambiar de página", async () => {
    const refreshOrders = vi.fn();
    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "1",
          description: "Order A",
          amount: 50,
          status: "PENDING",
          created_at: "2025-10-26",
        },
      ],
      page: 1,
      totalPages: 3,
      refreshOrders,
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);

    // Simula clic en botón "Go to page 2"
    const nextButton = screen.getByRole("button", { name: "Go to page 2" });
    fireEvent.click(nextButton);

    expect(refreshOrders).toHaveBeenCalledTimes(1);
    expect(refreshOrders).toHaveBeenCalledWith(2);
  });

  it("no llama a refreshOrders si se hace clic en la misma página", async () => {
    const refreshOrders = vi.fn();
    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "1",
          description: "Order B",
          amount: 50,
          status: "PAID",
          created_at: "2025-10-26",
        },
      ],
      page: 1,
      totalPages: 3,
      refreshOrders,
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);

    const currentPage = screen.getByRole("button", { name: /page 1/i });
    fireEvent.click(currentPage);
    expect(refreshOrders).toHaveBeenCalledWith(1);
  });

  it("refleja la página actual correctamente en el paginador", () => {
    mockUseApi.mockReturnValue({
      orders: [
        {
          id: "1",
          description: "Order C",
          amount: 120,
          status: "PENDING",
          created_at: "2025-10-26",
        },
      ],
      page: 3,
      totalPages: 5,
      refreshOrders: vi.fn(),
      highlightedOrders: new Set(),
      clearHighlight: vi.fn(),
    });

    render(<OrdersTable />);

    // Verifica que el botón activo sea el de la página actual
    const activePage = screen.getByRole("button", { name: /page 3/i });
    expect(activePage).toHaveAttribute("aria-current", "page");
  });
});
