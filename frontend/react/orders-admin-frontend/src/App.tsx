// src/App.tsx
import { CssBaseline, Container, Typography } from "@mui/material";
import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🧩 Orders Admin Panel
        </Typography>
        <AppRouter />
      </Container>
    </>
  );
}

export default App;
