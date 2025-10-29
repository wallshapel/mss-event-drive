import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";

function NotFound() {
  return <div data-testid="not-found">Página no encontrada</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} /> {/* ✅ Ruta 404 */}
      </Routes>
    </BrowserRouter>
  );
}
