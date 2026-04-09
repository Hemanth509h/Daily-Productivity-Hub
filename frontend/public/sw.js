const CACHE_NAME = 'quantum-productivity-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];
const DB_NAME = 'memorizes-sw';
const DB_VERSION = 1;
const AUTH_STORE = 'auth';
const NOTIFIED_STORE = 'notified';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SET_AUTH_TOKEN') {
    const token = event.data.token;
    if (typeof token !== 'string') return;
    storeValue(AUTH_STORE, 'accessToken', token);
    return;
  }

  if (event.data.type === 'CLEAR_AUTH_TOKEN') {
    deleteValue(AUTH_STORE, 'accessToken');
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const openClient = windowClients.find((client) => client.url.includes(url));
      if (openClient) {
        return openClient.focus();
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'task-reminder-sync') {
    event.waitUntil(checkTaskReminders());
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  const { title, body, url, tag } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag,
      data: { url }
    })
  );
});

async function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE);
      }
      if (!db.objectStoreNames.contains(NOTIFIED_STORE)) {
        db.createObjectStore(NOTIFIED_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeValue(storeName, key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteValue(storeName, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getValue(storeName, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function hasNotified(key) {
  return Boolean(await getValue(NOTIFIED_STORE, key));
}

async function setNotified(key) {
  await storeValue(NOTIFIED_STORE, key, true);
}

async function checkTaskReminders() {
  const token = await getValue(AUTH_STORE, 'accessToken');
  if (!token) return;

  let tasks;
  try {
    const response = await fetch('/api/tasks', {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/json'
      }
    });

    if (!response.ok) return;
    tasks = await response.json();
  } catch (err) {
    return;
  }

  if (!Array.isArray(tasks)) return;

  const now = Date.now();
  for (const task of tasks) {
    if (task.completed) continue;

    if (task.reminderTime) {
      const reminderTime = new Date(task.reminderTime).getTime();
      const timeDiff = reminderTime - now;
      const key = `sw-reminder-${task.id}`;
      if (timeDiff > 0 && timeDiff <= 300000 && !(await hasNotified(key))) {
        await showTaskNotification(task, 'Task Reminder', `📌 ${task.title || 'Untitled task'} — time to focus!`, key);
      }
      continue;
    }

    if (task.deadlineDate) {
      const deadlineTime = new Date(task.deadlineDate).getTime();
      const timeDiff = deadlineTime - now;
      const key = `sw-deadline-${task.id}`;
      if (timeDiff > 0 && timeDiff <= 300000 && !(await hasNotified(key))) {
        await showTaskNotification(task, 'Deadline Alert', `⚠️ ${task.title || 'Untitled task'} is due soon.`, key);
      }
    }
  }
}

async function showTaskNotification(task, title, body, key) {
  await self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: key,
    data: { url: `/tasks/${task.id}` },
    requireInteraction: true
  });
  await setNotified(key);
}
