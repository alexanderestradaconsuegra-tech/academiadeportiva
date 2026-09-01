import type { SessionLoad } from "./types"

/**
 * Acute:chronic workload ratio — the metric a professional club's sports
 * science staff looks at every week.
 *
 * The idea: what a player's body tolerates is what it has been doing for the
 * last month. Load this week far above that month-long baseline is the
 * classic pattern that precedes a soft-tissue injury; far below it means they
 * arrive at the match undertrained.
 *
 * Load per session is RPE (1-10 perceived effort) x minutes — the session-RPE
 * method, chosen because it needs no hardware. The ratio itself has real
 * methodological critics in the literature; it's used here the way clubs use
 * it, as a flag that tells a coach where to look, not as a diagnosis.
 */

export const ACUTE_DAYS = 7
export const CHRONIC_DAYS = 28

/**
 * How much history the ratio needs before it means anything. Without these,
 * a player's very first hard session divides against an almost-empty month
 * and reads as "riesgo alto" — a false alarm on day one, which is exactly how
 * a coach learns to ignore the flag before it ever catches a real spike.
 */
export const MIN_CHRONIC_SESSIONS = 4
export const MIN_HISTORY_DAYS = 14

export type LoadZone = "sin_datos" | "bajo" | "optimo" | "precaucion" | "riesgo"

export interface WorkloadSummary {
  /** Total load over the last 7 days. */
  acute: number
  /** The 28-day average expressed as a weekly figure, so it compares to acute. */
  chronic: number
  /** acute / chronic. Null until there's enough history to mean anything. */
  ratio: number | null
  zone: LoadZone
  /** Sessions counted in the acute window — context for a coach reading the zone. */
  acuteSessions: number
}

function daysBetween(fromISO: string, toISO: string): number {
  // Dates are plain YYYY-MM-DD; parse as UTC so a timezone behind UTC doesn't
  // shift every session a day and skew which window it lands in.
  const from = new Date(fromISO + "T00:00:00Z").getTime()
  const to = new Date(toISO + "T00:00:00Z").getTime()
  return Math.round((to - from) / 86_400_000)
}

/**
 * Zone thresholds follow the ranges the field settled on: 0.8-1.3 is the
 * "sweet spot", above 1.5 is where injury risk climbs sharply.
 */
export function zoneForRatio(ratio: number | null): LoadZone {
  if (ratio === null) return "sin_datos"
  if (ratio < 0.8) return "bajo"
  if (ratio <= 1.3) return "optimo"
  if (ratio <= 1.5) return "precaucion"
  return "riesgo"
}

export const ZONE_LABELS: Record<LoadZone, string> = {
  sin_datos: "Sin datos",
  bajo: "Carga baja",
  optimo: "Óptimo",
  precaucion: "Precaución",
  riesgo: "Riesgo alto",
}

export const ZONE_ADVICE: Record<LoadZone, string> = {
  sin_datos: "Falta registrar esfuerzo en las últimas semanas.",
  bajo: "Viene entrenando por debajo de lo habitual. Ojo si se viene competencia.",
  optimo: "Carga acorde a lo que su cuerpo viene tolerando.",
  precaucion: "Subió la carga más rápido de lo aconsejable. Conviene moderar.",
  riesgo: "Salto de carga grande respecto a su último mes. Alto riesgo de lesión.",
}

/**
 * @param loads   the player's sessions (any order, extra players filtered out beforehand)
 * @param todayISO reference date, so this stays testable and timezone-safe
 */
export function workloadSummary(loads: SessionLoad[], todayISO: string): WorkloadSummary {
  let acute = 0
  let chronicTotal = 0
  let acuteSessions = 0
  let chronicSessions = 0
  let oldestAge = 0

  for (const l of loads) {
    const age = daysBetween(l.date, todayISO)
    // Future-dated sessions are ignored rather than counted as "today": they
    // would inflate this week's load with training that hasn't happened.
    if (age < 0 || age >= CHRONIC_DAYS) continue
    chronicTotal += l.load
    chronicSessions++
    if (age > oldestAge) oldestAge = age
    if (age < ACUTE_DAYS) {
      acute += l.load
      acuteSessions++
    }
  }

  const chronic = chronicTotal / (CHRONIC_DAYS / ACUTE_DAYS)

  const hasBaseline =
    chronic > 0 && chronicSessions >= MIN_CHRONIC_SESSIONS && oldestAge >= MIN_HISTORY_DAYS
  const ratio = hasBaseline ? acute / chronic : null

  return {
    acute,
    chronic: Math.round(chronic),
    ratio: ratio === null ? null : Math.round(ratio * 100) / 100,
    zone: zoneForRatio(ratio),
    acuteSessions,
  }
}

/** Weekly load totals, oldest week first — the trend behind the ratio. */
export function weeklyLoads(loads: SessionLoad[], todayISO: string, weeks = 4): { weekStart: string; total: number }[] {
  const buckets: { weekStart: string; total: number }[] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const end = w * ACUTE_DAYS
    const start = end + ACUTE_DAYS
    const total = loads.reduce((sum, l) => {
      const age = daysBetween(l.date, todayISO)
      return age >= end && age < start && age >= 0 ? sum + l.load : sum
    }, 0)
    const d = new Date(todayISO + "T00:00:00Z")
    d.setUTCDate(d.getUTCDate() - (start - 1))
    buckets.push({ weekStart: d.toISOString().split("T")[0], total })
  }
  return buckets
}
