import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Estilos globales
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import "./styles/fonts.css";
import "./styles/buttons.css";

// Componentes principales
import App from "./App";
import AuthProvider from "./context/AuthProvider";

// Punto de entrada de la aplicación
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>
  );
} else {
  console.error("El elemento 'root' no fue encontrado en el DOM.");
}
