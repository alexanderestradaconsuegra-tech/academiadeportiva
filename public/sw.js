// Without these, a new deploy's service worker sits "waiting" until every
// open tab from the previous version is closed — during which the push
// toggle's `navigator.serviceWorker.ready` never resolves and just hangs.
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  let data = { title: "FutbolMetrics", body: "" }
  try {
    if (event.data) data = event.data.json()
  } catch {
    data = { title: "FutbolMetrics", body: event.data ? event.data.text() : "" }
  }

  const title = data.title || "FutbolMetrics"
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
