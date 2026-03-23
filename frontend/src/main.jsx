// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeContextProvider } from "./context/ThemeContext.jsx";
import { SnackbarProvider } from "./context/SnackbarContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);
