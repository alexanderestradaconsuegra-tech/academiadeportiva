import crypto from "crypto"

/**
 * Verifies MercadoPago's webhook signature (x-signature / x-request-id).
 *
 * MercadoPago signs the manifest "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 * with the per-webhook secret from the dashboard, and sends it as
 *   x-signature: ts=<unix>,v1=<hex hmac-sha256>
 *
 * Returns true when the signature checks out, false when it does not, and
 * null when verification could not be attempted (no secret configured, or the
 * headers are absent). Callers decide what to do with null — this module does
 * not decide policy.
 *
 * Note this is defence in depth, not the primary control: both webhook routes
 * already re-fetch the payment from MercadoPago's API and act on that, never
 * on the status in the request body. A forged request therefore cannot make
 * the app believe in a payment that did not happen; the signature check just
 * stops such requests from costing an API round trip.
 */
export function verifyMercadoPagoSignature(opts: {
  signatureHeader: string | null
  requestId: string | null
  dataId: string | null
  secret: string | undefined
}): boolean | null {
  const { signatureHeader, requestId, dataId, secret } = opts
  if (!secret) return null
  if (!signatureHeader || !dataId) return null

  const parts = Object.fromEntries(
    signatureHeader.split(",").map(p => {
      const [k, ...rest] = p.split("=")
      return [k.trim(), rest.join("=").trim()]
    })
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return null

  // MercadoPago lowercases an alphanumeric id in the manifest
  const normalizedId = /^[a-zA-Z0-9]+$/.test(dataId) ? dataId.toLowerCase() : dataId
  const manifest = `id:${normalizedId};${requestId ? `request-id:${requestId};` : ""}ts:${ts};`

  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex")

  const a = Buffer.from(expected, "utf8")
  const b = Buffer.from(v1, "utf8")
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
