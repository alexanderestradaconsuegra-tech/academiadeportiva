import { describe, it, expect } from "vitest"
import crypto from "crypto"
import { verifyMercadoPagoSignature } from "../mp-signature"

const SECRET = "un-secreto-de-prueba"

function sign(dataId: string, requestId: string, ts: string, secret = SECRET) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex")
}

describe("verifyMercadoPagoSignature", () => {
  it("accepts a correctly signed request", () => {
    const ts = "1700000000"
    const v1 = sign("123456", "req-1", ts)
    expect(
      verifyMercadoPagoSignature({
        signatureHeader: `ts=${ts},v1=${v1}`,
        requestId: "req-1",
        dataId: "123456",
        secret: SECRET,
      })
    ).toBe(true)
  })

  it("rejects a signature made with the wrong secret", () => {
    const ts = "1700000000"
    const v1 = sign("123456", "req-1", ts, "secreto-del-atacante")
    expect(
      verifyMercadoPagoSignature({
        signatureHeader: `ts=${ts},v1=${v1}`,
        requestId: "req-1",
        dataId: "123456",
        secret: SECRET,
      })
    ).toBe(false)
  })

  it("rejects when the payment id has been tampered with", () => {
    // Signature was issued for 123456; the attacker swaps in another payment.
    const ts = "1700000000"
    const v1 = sign("123456", "req-1", ts)
    expect(
      verifyMercadoPagoSignature({
        signatureHeader: `ts=${ts},v1=${v1}`,
        requestId: "req-1",
        dataId: "999999",
        secret: SECRET,
      })
    ).toBe(false)
  })

  it("returns null when no secret is configured, so callers can fall through", () => {
    expect(
      verifyMercadoPagoSignature({
        signatureHeader: "ts=1,v1=abc",
        requestId: "req-1",
        dataId: "123456",
        secret: undefined,
      })
    ).toBeNull()
  })

  it("returns null when the signature header is missing or malformed", () => {
    expect(
      verifyMercadoPagoSignature({ signatureHeader: null, requestId: "r", dataId: "1", secret: SECRET })
    ).toBeNull()
    expect(
      verifyMercadoPagoSignature({ signatureHeader: "garbage", requestId: "r", dataId: "1", secret: SECRET })
    ).toBeNull()
  })

  it("lowercases an alphanumeric id, matching MercadoPago's manifest", () => {
    const ts = "1700000000"
    const v1 = sign("abc123", "req-1", ts)
    expect(
      verifyMercadoPagoSignature({
        signatureHeader: `ts=${ts},v1=${v1}`,
        requestId: "req-1",
        dataId: "ABC123",
        secret: SECRET,
      })
    ).toBe(true)
  })
})
