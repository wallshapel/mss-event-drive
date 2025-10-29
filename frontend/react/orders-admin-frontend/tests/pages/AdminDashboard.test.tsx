import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminDashboard from "../../src/pages/AdminDashboard";
import { useApi } from "../../src/contexts/ApiContext";
import { notifySuccess, notifyError } from "../../src/utils/notify";

// 🧠 Mock de dependencias externas
vi.mock("../../src/contexts/ApiContext");
vi.mock("../../src/utils/notify");
vi.mock("../../src/components/OrdersTable", () => ({
  default: () => <div data-testid="orders-table">OrdersTableMock</div>,
}));

// 🧩 Helpers
const mockCreateOrder = vi.fn();
const mockRefreshOrders = vi.fn();
const mockClearHighlight = vi.fn();

const baseMockApi = {
  createOrder: mockCreateOrder,
  notifications: [],
  refreshOrders: mockRefreshOrders,
  highlightedOrders: new Set<number>([1, 2, 3]),
  clearHighlight: mockClearHighlight,
};

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as unknown as vi.Mock).mockReturnValue({ ...baseMockApi });
  });

  it("renderiza formulario, badge y tabla correctamente", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Crear nueva orden")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /crear orden/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Órdenes")).toBeInTheDocument();
    expect(screen.getByTestId("orders-table")).toBeInTheDocument();
  });

  it("llama a refreshOrders al montar", () => {
    render(<AdminDashboard />);
    expect(mockRefreshOrders).toHaveBeenCalledTimes(1);
  });

  it("muestra errores de validación si se envía vacío", async () => {
    render(<AdminDashboard />);
    const submitBtn = screen.getByRole("button", { name: /crear orden/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("La descripción es obligatoria")
      ).toBeInTheDocument();
      expect(screen.getByText("Debe ser un número")).toBeInTheDocument();
    });
  });

  it("crea una orden correctamente y muestra éxito", async () => {
    mockCreateOrder.mockResolvedValueOnce({});
    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Nueva orden" },
    });
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear orden/i }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith("Nueva orden", 200);
      expect(notifySuccess).toHaveBeenCalledWith(
        "Orden creada correctamente 🎉"
      );
    });
  });

  it("muestra error si createOrder lanza excepción", async () => {
    mockCreateOrder.mockRejectedValueOnce(new Error("Falla"));
    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "X" },
    });
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear orden/i }));

    await waitFor(() => {
      expect(notifyError).toHaveBeenCalledWith("Error al crear la orden");
    });
  });

  it("muestra el conteo correcto en el badge", () => {
    render(<AdminDashboard />);
    const badge = screen.getByText("Órdenes").closest(".MuiBadge-root");
    expect(badge?.textContent).toContain("3"); // hay 3 IDs en el Set
  });

  it("marca todas las órdenes como leídas al hacer clic", async () => {
    render(<AdminDashboard />);
    const button = screen.getByRole("button", {
      name: /marcar todo como leído/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClearHighlight).toHaveBeenCalledTimes(3); // 3 IDs en highlightedOrders
    });
  });

  it("deshabilita el botón de 'Marcar todo como leído' cuando no hay resaltadas", () => {
    (useApi as unknown as vi.Mock).mockReturnValue({
      ...baseMockApi,
      highlightedOrders: new Set(),
    });

    render(<AdminDashboard />);
    const button = screen.getByRole("button", {
      name: /marcar todo como leído/i,
    });
    expect(button).toBeDisabled();
  });
});
