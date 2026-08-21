import type { Attendance, Training } from "./types"

export type CommitmentLevel = "ejemplar" | "constante" | "irregular" | "ausente"

export interface Commitment {
  /** 0-100, or null when there is nothing to judge yet */
  rate: number | null
  level: CommitmentLevel | null
  present: number
  late: number
  absent: number
  /** Justified absences — excluded from the rate rather than counted against it */
  excused: number
  /** How many trainings the rate was computed over */
  counted: number
}

export const COMMITMENT_WINDOW = 10

export const COMMITMENT_LABELS: Record<CommitmentLevel, string> = {
  ejemplar: "Ejemplar",
  constante: "Constante",
  irregular: "Irregular",
  ausente: "Ausente",
}

// Tailwind class maps live here rather than in each page, matching how
// getScoreColor already works in lib/utils.ts
export const COMMITMENT_STYLE: Record<CommitmentLevel, string> = {
  ejemplar: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  constante: "bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400",
  irregular: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  ausente: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
}

export const COMMITMENT_TEXT: Record<CommitmentLevel, string> = {
  ejemplar: "text-emerald-600 dark:text-emerald-400",
  constante: "text-lime-700 dark:text-lime-400",
  irregular: "text-amber-600 dark:text-amber-400",
  ausente: "text-red-600 dark:text-red-400",
}

export const COMMITMENT_BAR: Record<CommitmentLevel, string> = {
  ejemplar: "bg-emerald-500",
  constante: "bg-lime-500",
  irregular: "bg-amber-500",
  ausente: "bg-red-500",
}

export function commitmentLevel(rate: number): CommitmentLevel {
  if (rate >= 90) return "ejemplar"
  if (rate >= 75) return "constante"
  if (rate >= 50) return "irregular"
  return "ausente"
}

/**
 * Commitment is deliberately separate from the player's rating: showing up is
 * not the same as being good, and folding attendance into the six attributes
 * would make the rating mean something it does not measure.
 *
 * Scored over the most recent trainings rather than all time, so a player who
 * stopped coming last month actually shows it instead of coasting on a year of
 * old attendance. Late still counts as showing up, at half weight. Excused
 * absences leave the denominator entirely — punishing a justified absence is
 * what makes a metric like this feel unfair.
 */
export function computeCommitment(
  attendance: Attendance[],
  trainings: Training[],
  window: number = COMMITMENT_WINDOW
): Commitment {
  const dateOf = new Map(trainings.map(t => [t.id, t.date]))

  const recent = attendance
    .filter(a => a.status !== null && dateOf.has(a.training_id))
    .sort((a, b) => (dateOf.get(b.training_id) ?? "").localeCompare(dateOf.get(a.training_id) ?? ""))
    .slice(0, window)

  const present = recent.filter(a => a.status === "present").length
  const late = recent.filter(a => a.status === "late").length
  const absent = recent.filter(a => a.status === "absent").length
  const excused = recent.filter(a => a.status === "excused").length

  const counted = present + late + absent
  if (counted === 0) {
    return { rate: null, level: null, present, late, absent, excused, counted: 0 }
  }

  const rate = Math.round(((present + late * 0.5) / counted) * 100)
  return { rate, level: commitmentLevel(rate), present, late, absent, excused, counted }
}
