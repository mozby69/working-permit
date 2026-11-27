self.addEventListener("push", (event) => {
  let payload = {
    title: "Working Permit System",
    body: "You have a new notification.",
    data: {
      url: "/",
    },
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json(),
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-192x192.png",
    tag: payload.tag,
    data: payload.data,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title,
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  let targetUrl = new URL("/", self.location.origin);

  try {
    const requestedUrl = new URL(
      event.notification.data?.url || "/",
      self.location.origin
    );

    if (requestedUrl.origin === self.location.origin) {
      targetUrl = requestedUrl;
    }
  } catch {
    // Fall back to the homepage.
  }

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (client.url === targetUrl.href) {
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl.href);
    })()
  );
});