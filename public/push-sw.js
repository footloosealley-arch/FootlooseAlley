self.addEventListener("push", (event) => {
  let payload = {
    title: "Footloose Alley",
    body: "A staff action needs your attention.",
    href: "/dashboard",
    tag: "staff-action",
  };

  try {
    const received = event.data?.json();
    if (received && typeof received === "object") {
      payload = { ...payload, ...received };
    }
  } catch {
    // The fallback above protects the notification flow from malformed payloads.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/footloose-alley-app-icon-192.png",
      badge: "/footloose-alley-app-icon-192.png",
      tag: payload.tag,
      data: { href: payload.href },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = typeof event.notification.data?.href === "string"
    ? event.notification.data.href
    : "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((windowClient) => "focus" in windowClient);
      if (existing) {
        existing.focus();
        return existing.navigate(href);
      }
      return clients.openWindow(href);
    })
  );
});
