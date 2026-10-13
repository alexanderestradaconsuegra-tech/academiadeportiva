import { describe, it, expect } from "vitest"
import { isAllowedPushEndpoint } from "../push-endpoint"

// A push endpoint is a URL the server will POST to. It must only ever be a
// browser vendor's push service, never an address of the caller's choosing.
describe("isAllowedPushEndpoint", () => {
  it("accepts the real push services", () => {
    for (const e of [
      "https://fcm.googleapis.com/fcm/send/abc123",
      "https://updates.push.services.mozilla.com/wpush/v2/gAAAA",
      "https://web.push.apple.com/QGxxxx",
      "https://wns2-par02p.notify.windows.com/w/?token=abc",
    ]) expect(isAllowedPushEndpoint(e)).toBe(true)
  })

  it("refuses internal and arbitrary hosts", () => {
    for (const e of [
      "https://localhost/x",
      "https://127.0.0.1/x",
      "https://169.254.169.254/latest/meta-data",
      "https://10.0.0.5/x",
      "https://attacker.example/collect",
      "https://supabase.internal/x",
    ]) expect(isAllowedPushEndpoint(e)).toBe(false)
  })

  it("refuses plain http", () => {
    expect(isAllowedPushEndpoint("http://fcm.googleapis.com/fcm/send/abc")).toBe(false)
  })

  it("is not fooled by a trusted name used as a prefix, subdomain of the attacker, or userinfo", () => {
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com.attacker.example/x")).toBe(false)
    expect(isAllowedPushEndpoint("https://notfcm.googleapis.com.evil.io/x")).toBe(false)
    // ends with the vendor name but is not a subdomain of it: needs the dot boundary
    expect(isAllowedPushEndpoint("https://evilfcm.googleapis.com/x")).toBe(false)
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com@attacker.example/x")).toBe(false)
    expect(isAllowedPushEndpoint("https://user:pass@fcm.googleapis.com/x")).toBe(false)
  })

  it("refuses an explicit port, junk and non-strings", () => {
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com:8443/x")).toBe(false)
    for (const v of ["", "not a url", null, undefined, 42, {}]) expect(isAllowedPushEndpoint(v)).toBe(false)
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com/" + "a".repeat(3000))).toBe(false)
  })
})
