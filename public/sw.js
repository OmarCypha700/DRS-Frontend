self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal passthrough — no offline caching strategy was asked for, but a
// fetch handler is required for Chrome's installability checks.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Document Request System", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Document Request System";
  // No `silent: true` — the OS/browser plays its own default notification
  // sound. A custom sound isn't possible here; only a foreground in-app
  // toast could carry one, which wasn't wanted.
  const options = {
    body: payload.body || "",
    icon: "/icon-192",
    badge: "/icon-192",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);

      if ("setAppBadge" in self.registration && typeof payload.badgeCount === "number") {
        try {
          if (payload.badgeCount > 0) {
            await self.registration.setAppBadge(payload.badgeCount);
          } else {
            await self.registration.clearAppBadge();
          }
        } catch {
          // Badging API not available on this platform (e.g. iOS) — no-op.
        }
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});
