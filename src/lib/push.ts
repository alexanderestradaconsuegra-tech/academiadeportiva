import { supabase } from "@/lib/supabase"

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
}

export async function registerServiceWorker() {
  if (!isPushSupported()) return null
  try {
    return await navigator.serviceWorker.register("/sw.js")
  } catch (err) {
    console.error("registerServiceWorker:", err)
    return null
  }
}

export async function getPushSubscriptionStatus(): Promise<"subscribed" | "unsubscribed" | "unsupported"> {
  if (!isPushSupported()) return "unsupported"
  const registration = await navigator.serviceWorker.ready.catch(() => null)
  if (!registration) return "unsubscribed"
  const sub = await registration.pushManager.getSubscription()
  return sub ? "subscribed" : "unsubscribed"
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0))
}

async function authHeader() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

export async function subscribeToPush(): Promise<string | null> {
  if (!isPushSupported()) return "Tu navegador no soporta notificaciones push."
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return "Notificaciones no configuradas en el servidor."

  const registration = await navigator.serviceWorker.register("/sw.js")
  await navigator.serviceWorker.ready

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return "Permiso de notificaciones denegado."

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  const json = subscription.toJSON()
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: await authHeader(),
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return data.error || "No se pudo activar las notificaciones."
  }
  return null
}

export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready.catch(() => null)
  if (!registration) return null
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return null

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()

  const res = await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: await authHeader(),
    body: JSON.stringify({ endpoint }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return data.error || "No se pudo desactivar las notificaciones."
  }
  return null
}
