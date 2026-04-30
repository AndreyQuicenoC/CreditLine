import React from "react";
// @ts-ignore: Ignore missing type declarations for react-dom/client
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext";
import App from "./app/App";
// @ts-ignore: Ignore missing type declarations for CSS imports
import "./styles/index.css";

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
