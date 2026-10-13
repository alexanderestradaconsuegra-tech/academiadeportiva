import { describe, it, expect } from "vitest"
import { safePlan, approvalDate, shouldApplyPeriod, shouldActivateFromPreapproval } from "../subscription-period"
import { periodEndFromPlan } from "../mercadopago"

const NOW = new Date("2026-10-13T12:00:00Z")

// This decides who keeps access to the product. The case that mattered — the
// same approved payment arriving twice — is invisible in normal use.
describe("replaying a payment notification", () => {
  it("buys nothing: the same payment computes the same end date, which is not later", () => {
    const approved = "2026-09-01T10:00:00Z"
    const end = periodEndFromPlan("monthly", approvalDate(approved, NOW))
    // First delivery stores `end`. Replaying the same id a month later computes
    // the same value again — it is not > what is stored, so it is refused.
    expect(shouldApplyPeriod(end.toISOString(), periodEndFromPlan("monthly", approvalDate(approved, new Date("2026-11-20T00:00:00Z"))))).toBe(false)
  })

  it("does not matter when the replay happens", () => {
    const approved = "2026-09-01T10:00:00Z"
    const stored = periodEndFromPlan("monthly", approvalDate(approved, NOW)).toISOString()
    for (const replayAt of ["2026-10-01T00:00:00Z", "2027-03-01T00:00:00Z"]) {
      const again = periodEndFromPlan("monthly", approvalDate(approved, new Date(replayAt)))
      expect(shouldApplyPeriod(stored, again)).toBe(false)
    }
  })

  it("still extends for a genuinely new payment", () => {
    const stored = periodEndFromPlan("monthly", new Date("2026-09-01T10:00:00Z")).toISOString()
    const next = periodEndFromPlan("monthly", new Date("2026-10-01T10:00:00Z"))
    expect(shouldApplyPeriod(stored, next)).toBe(true)
  })

  it("never shortens a period when an older payment arrives late", () => {
    const stored = periodEndFromPlan("monthly", new Date("2026-10-01T10:00:00Z")).toISOString()
    const older = periodEndFromPlan("monthly", new Date("2026-09-01T10:00:00Z"))
    expect(shouldApplyPeriod(stored, older)).toBe(false)
  })

  it("applies the very first payment, when nothing is stored yet", () => {
    expect(shouldApplyPeriod(null, periodEndFromPlan("monthly", NOW))).toBe(true)
    expect(shouldApplyPeriod(undefined, periodEndFromPlan("monthly", NOW))).toBe(true)
  })

  it("treats an unreadable stored date as nothing stored rather than locking the academy out", () => {
    expect(shouldApplyPeriod("not-a-date", periodEndFromPlan("monthly", NOW))).toBe(true)
  })
})

describe("approvalDate", () => {
  it("uses the payment's own approval date", () => {
    expect(approvalDate("2026-09-01T10:00:00Z", NOW).toISOString()).toBe("2026-09-01T10:00:00.000Z")
  })

  it("clamps a date in the future, which would extend access for free", () => {
    expect(approvalDate("2030-01-01T00:00:00Z", NOW).getTime()).toBe(NOW.getTime())
  })

  it("falls back to now for a missing or unparseable date", () => {
    expect(approvalDate(undefined, NOW).getTime()).toBe(NOW.getTime())
    expect(approvalDate("garbage", NOW).getTime()).toBe(NOW.getTime())
    expect(approvalDate(12345, NOW).getTime()).toBe(NOW.getTime())
  })
})

describe("safePlan", () => {
  it("only an exact 'annual' earns the longer period", () => {
    expect(safePlan("annual")).toBe("annual")
    expect(safePlan("monthly")).toBe("monthly")
  })

  it("anything else — including a mangled reference — is the shorter one", () => {
    // external_reference is split on "::", so a hostile value could smuggle in "annual".
    for (const v of [undefined, null, "", "ANNUAL", "annual ", "annual::monthly", "yearly", 12]) {
      expect(safePlan(v)).toBe("monthly")
    }
  })
})

describe("periodEndFromPlan", () => {
  it("counts a month or a year from the date given, not from today", () => {
    expect(periodEndFromPlan("monthly", new Date("2026-01-15T00:00:00Z")).toISOString()).toBe("2026-02-15T00:00:00.000Z")
    expect(periodEndFromPlan("annual", new Date("2026-01-15T00:00:00Z")).toISOString()).toBe("2027-01-15T00:00:00.000Z")
  })

  it("does not mutate the date it was given", () => {
    const from = new Date("2026-01-15T00:00:00Z")
    periodEndFromPlan("monthly", from)
    expect(from.toISOString()).toBe("2026-01-15T00:00:00.000Z")
  })
})

describe("shouldActivateFromPreapproval", () => {
  it("switches an academy on the first time", () => {
    expect(shouldActivateFromPreapproval("active", null, NOW)).toBe(true)
    expect(shouldActivateFromPreapproval("past_due", "2026-12-01T00:00:00Z", NOW)).toBe(true)
  })

  it("brings back an academy whose paid period has lapsed", () => {
    expect(shouldActivateFromPreapproval("active", "2026-09-01T00:00:00Z", NOW)).toBe(true)
  })

  it("does not hand out another period while already paid through a future date", () => {
    // The notification repeats for as long as the subscription exists.
    expect(shouldActivateFromPreapproval("active", "2026-11-01T00:00:00Z", NOW)).toBe(false)
  })
})
