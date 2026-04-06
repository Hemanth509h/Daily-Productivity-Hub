import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { setBaseUrl } from "./api-client-react";
import "./index.css";

setBaseUrl('http://localhost:3001');

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
