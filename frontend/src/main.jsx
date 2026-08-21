import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

import {
  AuthProvider
} from "./auth/AuthContext.jsx";

// Global unhandled error tracer for "next is not a function"
if (import.meta.env.DEV) {
  window.addEventListener("unhandledrejection", (e) => {
    const msg = e.reason?.message || e.message || "";
    if (typeof msg === "string" && msg.includes("next is not a function")) {
      console.error("🔴 [UNHANDLED REJECTION] 'next is not a function':", e.reason);
      console.trace("Stack trace:");
    }
  });
  window.addEventListener("error", (e) => {
    const msg = e.message || "";
    if (typeof msg === "string" && msg.includes("next is not a function")) {
      console.error("🔴 [UNHANDLED ERROR] 'next is not a function':", e.error || e);
      console.trace("Stack trace:");
    }
  });
}

createRoot(document.getElementById("root")).render(
  <>
    <AuthProvider>
      <App />
    </AuthProvider>

    <Toaster
      position="top-right"
      reverseOrder={false}
    />
  </>
);