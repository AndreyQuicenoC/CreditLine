import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext";
import App from "./app/App";
import "./styles/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
