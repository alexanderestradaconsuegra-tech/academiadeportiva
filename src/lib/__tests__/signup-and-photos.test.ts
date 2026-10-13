import { describe, it, expect } from "vitest"
import { safeImageType, isServablePhotoPath } from "../photo-safety"
import { generateActivationCode, normalizeEmail, isValidEmail, cleanAcademyName } from "../signup-guards"
import { escapeHtml } from "../email"

// Photos are served back from the app's own origin. A file uploaded as HTML or
// SVG and opened by a logged-in user would run as the app, with their session.
describe("safeImageType", () => {
  it("serves plain raster images", () => {
    for (const t of ["image/jpeg", "image/png", "image/webp", "image/gif"]) expect(safeImageType(t)).toBe(t)
  })

  it("refuses anything that can carry script", () => {
    for (const t of ["text/html", "image/svg+xml", "application/xhtml+xml", "text/xml", "application/javascript", "application/pdf", "application/octet-stream"]) {
      expect(safeImageType(t)).toBeNull()
    }
  })

  it("ignores parameters and case, but not the type itself", () => {
    expect(safeImageType("IMAGE/PNG; charset=binary")).toBe("image/png")
    expect(safeImageType("text/html; charset=image/png")).toBeNull()
  })

  it("refuses a missing type rather than guessing", () => {
    expect(safeImageType(undefined)).toBeNull()
    expect(safeImageType(null)).toBeNull()
    expect(safeImageType("")).toBeNull()
  })
})

describe("isServablePhotoPath", () => {
  it("accepts exactly <players|team>/<file>", () => {
    expect(isServablePhotoPath(["players", "abc.png"])).toBe(true)
    expect(isServablePhotoPath(["team", "abc.jpg"])).toBe(true)
  })

  it("refuses any other folder — those used to pass as 'not claimed by anyone'", () => {
    expect(isServablePhotoPath(["evil", "x.html"])).toBe(false)
    expect(isServablePhotoPath(["landing", ".emptyFolderPlaceholder"])).toBe(false)
  })

  it("refuses traversal, nesting and hidden files", () => {
    expect(isServablePhotoPath(["players", ".."])).toBe(false)
    expect(isServablePhotoPath(["players", "..", "team", "x.png"])).toBe(false)
    expect(isServablePhotoPath(["players", "a", "b.png"])).toBe(false)
    expect(isServablePhotoPath(["players", ".hidden"])).toBe(false)
    expect(isServablePhotoPath(["players", "a..b.png"])).toBe(false)
    expect(isServablePhotoPath(["players"])).toBe(false)
    expect(isServablePhotoPath([])).toBe(false)
    expect(isServablePhotoPath(undefined)).toBe(false)
  })
})

describe("generateActivationCode", () => {
  it("has the prefix and eight unambiguous characters", () => {
    expect(generateActivationCode("DEMO")).toMatch(/^DEMO-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
  })

  it("does not repeat across a large sample", () => {
    const seen = new Set(Array.from({ length: 5000 }, () => generateActivationCode("PAY")))
    expect(seen.size).toBe(5000)
  })
})

describe("normalizeEmail / isValidEmail", () => {
  it("treats differently-cased addresses as the same person", () => {
    expect(normalizeEmail("  Ana@Club.CL ")).toBe("ana@club.cl")
  })

  it("returns empty for anything that is not a string", () => {
    expect(normalizeEmail(undefined)).toBe("")
    expect(normalizeEmail({ a: 1 })).toBe("")
  })

  it("accepts ordinary addresses", () => {
    expect(isValidEmail("ana@club.cl")).toBe(true)
    expect(isValidEmail("a.b+c@sub.club.com")).toBe(true)
  })

  it("rejects things that are not one clean address", () => {
    for (const v of ["", "nope", "a@b", "a b@c.cl", "a@b.cl, c@d.cl", "<x>@y.cl", 'a"@b.cl', "a@b.c", "x".repeat(250) + "@y.cl"]) {
      expect(isValidEmail(v)).toBe(false)
    }
  })
})

describe("cleanAcademyName", () => {
  it("trims, collapses whitespace and caps the length", () => {
    expect(cleanAcademyName("  Club   Los   Andes ")).toBe("Club Los Andes")
    expect(cleanAcademyName("x".repeat(500))).toHaveLength(80)
  })

  it("returns empty for non-strings", () => {
    expect(cleanAcademyName(null)).toBe("")
    expect(cleanAcademyName(42)).toBe("")
  })
})

// The academy name is typed by an anonymous visitor and mailed, from our own
// address, to whatever email they entered.
describe("escapeHtml", () => {
  it("neutralises markup planted in a name", () => {
    const out = escapeHtml('<a href="https://evil.example">Entra aquí</a>')
    expect(out).not.toContain("<")
    expect(out).not.toContain('"')
    expect(out).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;")
  })

  it("escapes ampersands first, so it does not double-escape its own output", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B")
    expect(escapeHtml("&lt;")).toBe("&amp;lt;")
  })

  it("leaves ordinary names alone", () => {
    expect(escapeHtml("Club Deportivo Los Andes")).toBe("Club Deportivo Los Andes")
  })
})
