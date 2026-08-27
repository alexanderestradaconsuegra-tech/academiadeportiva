import { describe, it, expect } from "vitest"
import { effectivePaymentStatus } from "../types"
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

  it("turns pending into overdue once the due date has passed", () => {
    expect(effectivePaymentStatus(payment("pending", "2026-01-01"), "2026-01-02")).toBe("overdue")
  })

  it("leaves a payment pending on its own due date, not overdue", () => {
    // Due today still means due, not late — an off-by-one here would
    // dun every parent one day early, every month.
    expect(effectivePaymentStatus(payment("pending", "2026-01-15"), "2026-01-15")).toBe("pending")
  })

  it("leaves a future payment pending", () => {
    expect(effectivePaymentStatus(payment("pending", "2026-12-01"), "2026-01-01")).toBe("pending")
  })
})
