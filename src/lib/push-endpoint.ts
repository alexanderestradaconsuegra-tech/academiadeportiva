/**
 * Where a browser may tell us to send its push notifications.
 *
 * A subscription carries an `endpoint` URL, and when a coach sends a
 * notification the server POSTs to every stored endpoint. Nothing checked what
 * that URL was, so any signed-in user — a player, say — could register an
 * address inside the hosting network and have the server call it. Real
 * browsers only ever hand out endpoints on their vendor's push service, so
 * those are the only hosts accepted.
 */
const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com",                // Chrome, Edge, Brave, Opera, Samsung
  "android.googleapis.com",            // legacy Chrome
  "push.services.mozilla.com",         // Firefox
  "push.apple.com",                    // Safari / iOS web push
  "notify.windows.com",                // Edge on Windows (WNS)
]

export function isAllowedPushEndpoint(endpoint: unknown): boolean {
  if (typeof endpoint !== "string" || endpoint.length > 2048) return false
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    return false
  }
  if (url.protocol !== "https:") return false
  // No credentials in the URL, no explicit port: a push service has neither.
  if (url.username || url.password || url.port) return false
  const host = url.hostname.toLowerCase()
  return PUSH_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith("." + suffix))
}
