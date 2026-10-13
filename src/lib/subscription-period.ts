/**
 * Rules for turning a MercadoPago notification into a paid-through date.
 *
 * Pure on purpose: this decides who keeps access to the product, and the case
 * that mattered — the same approved payment arriving twice — is easy to get
 * wrong and invisible in normal use.
 */

export type Plan = "monthly" | "annual"

/**
 * The plan comes out of a string we put in `external_reference` and then split
 * on "::". Anything that is not exactly "annual" is treated as monthly, so a
 * mangled or hostile reference can only ever buy the shorter period.
 */
export function safePlan(plan: unknown): Plan {
  return plan === "annual" ? "annual" : "monthly"
}

/**
 * When the payment was actually approved, falling back to now.
 *
 * A date in the future would extend access for free, so it is clamped to now;
 * an unparseable one falls back to now as well.
 */
export function approvalDate(dateApproved: unknown, now: Date = new Date()): Date {
  if (typeof dateApproved !== "string") return now
  const d = new Date(dateApproved)
  if (Number.isNaN(d.getTime())) return now
  return d.getTime() > now.getTime() ? now : d
}

/**
 * Apply a new paid-through date only if it extends the current one.
 *
 * Replaying an old notification computes the same end date again — which is
 * not later than what is stored, so nothing changes. An older payment arriving
 * late never shortens a period either.
 */
export function shouldApplyPeriod(currentEnd: string | null | undefined, newEnd: Date): boolean {
  if (!currentEnd) return true
  const current = new Date(currentEnd).getTime()
  if (Number.isNaN(current)) return true
  return newEnd.getTime() > current
}

/**
 * A preapproval stays "authorized" for as long as the subscription exists, so
 * the notification repeats. It should switch an academy on the first time, or
 * bring one back after a lapse — not hand out another period every time it is
 * re-sent while the academy is already paid through a future date.
 */
export function shouldActivateFromPreapproval(
  status: string | null | undefined,
  currentEnd: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (status !== "active") return true
  if (!currentEnd) return true
  const end = new Date(currentEnd).getTime()
  if (Number.isNaN(end)) return true
  return end <= now.getTime()
}
