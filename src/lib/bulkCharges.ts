import type { Category, Payment, Player } from "./types"

/**
 * Decides who a bulk charge ("cobrar la matrícula a toda la academia") applies to.
 *
 * Registering charges one student at a time doesn't survive an academy of a
 * hundred players. This is the pure half of doing it in one go: work out the
 * recipients, and — the part that matters — who must be left out.
 */

export type BulkTarget =
  | { kind: "all" }
  | { kind: "category"; category: Category }
  | { kind: "players"; ids: string[] }

export interface BulkPlanInput {
  players: Player[]
  payments: Pick<Payment, "player_id" | "concept" | "due_date">[]
  concept: string
  dueDate: string
  target: BulkTarget
}

export interface BulkPlan {
  /** Everyone the target selects, before removing duplicates. */
  recipients: Player[]
  /** Who will actually be charged. */
  toCreate: Player[]
  /** Selected players who already have this exact charge — skipped, not doubled. */
  alreadyHave: Player[]
}

function selectRecipients(players: Player[], target: BulkTarget): Player[] {
  switch (target.kind) {
    case "all":
      return players
    case "category":
      return players.filter(p => p.category === target.category)
    case "players": {
      // Ids that no longer match a player (someone deleted between opening
      // the list and confirming) are dropped rather than becoming an orphan charge.
      const wanted = new Set(target.ids)
      return players.filter(p => wanted.has(p.id))
    }
  }
}

/**
 * A player who already has this concept on this due date is skipped.
 *
 * The database refuses a second monthly fee for the same player and date, and
 * an insert of many rows fails as a whole if any one row is refused — so one
 * repeat would have cost the coach the entire batch. Skipping also covers the
 * more common human case: pressing the button twice.
 *
 * A charge that was already paid still counts as "have": billing someone again
 * for something they settled is the worst outcome available here.
 */
export function planBulkCharges(input: BulkPlanInput): BulkPlan {
  const { players, payments, concept, dueDate, target } = input
  const recipients = selectRecipients(players, target)

  const taken = new Set(
    payments
      .filter(p => p.concept === concept && p.due_date === dueDate)
      .map(p => p.player_id)
  )

  const toCreate: Player[] = []
  const alreadyHave: Player[] = []
  for (const p of recipients) {
    if (taken.has(p.id)) alreadyHave.push(p)
    else toCreate.push(p)
  }
  return { recipients, toCreate, alreadyHave }
}

/** Total in whole currency units, for the confirmation line ("87 cobros · $4.785.000"). */
export function bulkTotal(count: number, amount: number): number {
  return Math.round(count * amount * 100) / 100
}
