import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration.scope);

    if ('periodicSync' in registration && 'permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        if (status.state === 'granted') {
          await registration.periodicSync.register('task-reminder-sync', {
            minInterval: 4 * 60 * 60 * 1000 // 4 hours
          });
          console.log('Periodic sync registered for task reminders');
        }
      } catch (err) {
        console.warn('Periodic background sync not available:', err);
      }
    }
  } catch (err) {
    console.error('Service Worker registration failed:', err);
  }
}

registerServiceWorker();

createRoot(document.getElementById("root")).render(
  <App />
);
