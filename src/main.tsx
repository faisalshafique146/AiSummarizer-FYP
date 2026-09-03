import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import AuthProvider from "./features/auth/AuthProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Unable to find the root application element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
