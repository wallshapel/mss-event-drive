import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppRouter } from "../../src/router/AppRouter";

// 🧠 Mock del componente AdminDashboard
vi.mock("../../src/pages/AdminDashboard", () => ({
  default: () => <div data-testid="admin-dashboard">AdminDashboardMock</div>,
}));

// 🧠 Mock global del BrowserRouter con ruta controlable
let mockInitialRoute = "/"; // 👈 se puede cambiar por test
vi.mock("react-router-dom", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => (
      <actual.MemoryRouter initialEntries={[mockInitialRoute]}>
        {children}
      </actual.MemoryRouter>
    ),
  };
});

describe("AppRouter", () => {
  it("renderiza sin errores", () => {
    mockInitialRoute = "/";
    render(<AppRouter />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("muestra AdminDashboard cuando la ruta es '/'", () => {
    mockInitialRoute = "/";
    render(<AppRouter />);
    expect(screen.getByText("AdminDashboardMock")).toBeInTheDocument();
  });

  it("no muestra AdminDashboard en una ruta inexistente", async () => {
    mockInitialRoute = "/no-existe"; // 👈 cambiamos la ruta simulada
    const { AppRouter: FreshRouter } = await import("../../src/router/AppRouter"); // recarga con nueva ruta
    render(<FreshRouter />);

    // AdminDashboard NO debe estar, pero NotFound SÍ
    expect(screen.queryByTestId("admin-dashboard")).not.toBeInTheDocument();
    expect(screen.getByTestId("not-found")).toBeInTheDocument();
  });
});
