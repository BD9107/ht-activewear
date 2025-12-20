import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver loop error (non-critical, common with UI libraries)
const resizeObserverErr = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (message === 'ResizeObserver loop completed with undelivered notifications.' ||
      message === 'ResizeObserver loop limit exceeded') {
    return true; // Suppress the error
  }
  if (resizeObserverErr) {
    return resizeObserverErr(message, source, lineno, colno, error);
  }
  return false;
};

// Also handle it in the error event
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
    e.stopPropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
