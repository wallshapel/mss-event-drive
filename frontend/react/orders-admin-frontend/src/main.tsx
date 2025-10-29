// src/main.tsx
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ApiProvider } from "./contexts/ApiContext.tsx";
import { SnackbarProvider } from "notistack";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <ApiProvider>
        <App />
      </ApiProvider>
    </SnackbarProvider>
);
