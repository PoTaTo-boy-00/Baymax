import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { AuthProvider } from "../contexts/AuthContext.jsx";
// import { App } from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
    <Toaster />
  </AuthProvider>
);
