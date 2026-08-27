import { describe, it, expect } from "vitest"
import { effectivePaymentStatus, resolveMonthlyChargeDate, PAYMENT_GRACE_DAYS } from "../types"
import type { Payment } from "../types"

function payment(status: Payment["status"], due_date: string): Payment {
  return {
    id: "pay-1",
    player_id: "p1",
    academy_id: "a1",
    concept: "Mensualidad",
    amount: 30000,
    due_date,
    paid_date: null,
    status,
    receipt_path: null,
    receipt_note: null,
    receipt_uploaded_at: null,
    rejection_note: null,
    created_at: "2026-01-01",
  } as unknown as Payment
}

// This function decides what a parent is told they owe, and drives the
// overdue totals on the dashboard. Getting it wrong means either chasing
// someone who already paid, or silently letting a debt go unnoticed.
describe("effectivePaymentStatus", () => {
  it("keeps a paid payment paid even long past its due date", () => {
    expect(effectivePaymentStatus(payment("paid", "2026-01-01"), "2026-06-01")).toBe("paid")
  })

  it("keeps a receipt under review as such, instead of flagging it overdue", () => {
    // A parent who uploaded proof and is waiting on the coach must not be
    // shown as a debtor while the coach reviews it.
    expect(effectivePaymentStatus(payment("en_revision", "2026-01-01"), "2026-06-01")).toBe("en_revision")
  })

  it("leaves a payment pending on its own due date, not overdue", () => {
    // Due today still means due, not late — an off-by-one here would
    // dun every parent one day early, every month.
    expect(effectivePaymentStatus(payment("pending", "2026-01-15"), "2026-01-15")).toBe("pending")
  })

  it("leaves a future payment pending", () => {
    expect(effectivePaymentStatus(payment("pending", "2026-12-01"), "2026-01-01")).toBe("pending")
  })

  it("stays pending through the grace period", () => {
    // Due the 1st, 5 days of grace: the 2nd through the 5th are still pending.
    expect(effectivePaymentStatus(payment("pending", "2026-01-01"), "2026-01-02")).toBe("pending")
    expect(effectivePaymentStatus(payment("pending", "2026-01-01"), "2026-01-05")).toBe("pending")
  })

  it("turns overdue exactly PAYMENT_GRACE_DAYS after the due date, not before", () => {
    const dueDate = "2026-01-01"
    const lastGraceDay = "2026-01-05" // due_date + 4
    const firstOverdueDay = "2026-01-06" // due_date + 5
    expect(effectivePaymentStatus(payment("pending", dueDate), lastGraceDay)).toBe("pending")
    expect(effectivePaymentStatus(payment("pending", dueDate), firstOverdueDay)).toBe("overdue")
    expect(PAYMENT_GRACE_DAYS).toBe(5) // documents the assumption the two dates above encode
  })

  it("crosses a month boundary correctly when computing the grace window", () => {
    // Due Jan 30 + 5 days lands in February — a naive same-month calculation
    // would get this wrong.
    expect(effectivePaymentStatus(payment("pending", "2026-01-30"), "2026-02-03")).toBe("pending")
    expect(effectivePaymentStatus(payment("pending", "2026-01-30"), "2026-02-04")).toBe("overdue")
  })
})

// Decides which month a newly-configured or newly-generated monthly fee gets
// dated to. Getting this wrong either silently skips billing a month, or
// backdates a debt a family never actually had a chance to pay on time.
describe("resolveMonthlyChargeDate", () => {
  it("targets the 1st of the current month when comfortably within the grace window", () => {
    expect(resolveMonthlyChargeDate("2026-03-01")).toBe("2026-03-01")
    expect(resolveMonthlyChargeDate("2026-03-05")).toBe("2026-03-01")
  })

  it("skips to next month once a current-month charge would already read as overdue", () => {
    // Activating the fee on the 6th (or later) must not create a charge
    // that is instantly "Vencido" the moment it appears.
    expect(resolveMonthlyChargeDate("2026-03-06")).toBe("2026-04-01")
    expect(resolveMonthlyChargeDate("2026-03-20")).toBe("2026-04-01")
  })

  it("rolls over the year when the skip happens in December", () => {
    expect(resolveMonthlyChargeDate("2026-12-20")).toBe("2027-01-01")
  })
})
