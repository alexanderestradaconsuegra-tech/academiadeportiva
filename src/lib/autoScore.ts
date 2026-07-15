import type { Activity, Attendance, Evaluation, ActivityCategory } from "@/lib/types"

const CATEGORY_TO_FIELD: Record<ActivityCategory, keyof Pick<Evaluation,
  "speed_score" | "strength_score" | "technique_score" |
  "resistance_score" | "power_score" | "agility_score">> = {
  "Velocidad":   "speed_score",
  "Fuerza":      "strength_score",
  "Técnica":     "technique_score",
  "Resistencia": "resistance_score",
  "Potencia":    "power_score",
  "Agilidad":    "agility_score",
}

// Units where a LOWER value means BETTER performance (sprint times, etc.)
const LOWER_IS_BETTER: ActivityUnit[] = ["segundos"]
type ActivityUnit = "segundos" | "kg" | "repeticiones" | "metros" | "puntos"

export type TrendDirection = "up" | "down" | "stable" | "no_data"

export interface SkillTrend {
  field: keyof Pick<Evaluation, "speed_score" | "strength_score" | "technique_score" | "resistance_score" | "power_score" | "agility_score">
  category: ActivityCategory
  trend: TrendDirection
  delta: number          // change relative to base score (–10 to +10)
  recentAvg: number | null
  prevAvg: number | null
}

export interface AutoScore {
  scores: Record<string, number>  // adjusted scores per field (1–10)
  trends: SkillTrend[]
  attendancePenalty: number       // 0 to –2 applied to all scores
  attendanceRate: number          // 0–100 %
  hasData: boolean
}

function avg(vals: number[]): number {
  return vals.reduce((s, v) => s + v, 0) / vals.length
}

function clamp(v: number): number {
  return Math.min(10, Math.max(1, Math.round(v * 10) / 10))
}

/**
 * Calculates live auto-scores based on recent activities and attendance.
 * Does NOT modify any stored data — purely computed.
 */
export function calcAutoScore(
  baseEval: Evaluation | undefined,
  activities: Activity[],
  attendances: Attendance[],
): AutoScore {
  const trends: SkillTrend[] = []
  const adjusted: Record<string, number> = {}

  // ── Seed adjusted scores from the base evaluation ────────────────────────
  const BASE: Record<string, number> = baseEval ? {
    speed_score:      baseEval.speed_score,
    strength_score:   baseEval.strength_score,
    technique_score:  baseEval.technique_score,
    resistance_score: baseEval.resistance_score,
    power_score:      baseEval.power_score,
    agility_score:    baseEval.agility_score,
  } : {
    speed_score: 5, strength_score: 5, technique_score: 5,
    resistance_score: 5, power_score: 5, agility_score: 5,
  }

  Object.assign(adjusted, BASE)

  // ── Attendance penalty (last 8 trainings) ────────────────────────────────
  const last8 = attendances.slice(-8)
  const presentCount = last8.filter(a => a.status === "present" || a.status === "late").length
  const attendanceRate = last8.length > 0 ? Math.round((presentCount / last8.length) * 100) : 100

  // Penalty: 0 (100% attendance) to –2 (0% attendance)
  const attendancePenalty = last8.length >= 3
    ? parseFloat((((100 - attendanceRate) / 100) * -2).toFixed(1))
    : 0

  // Apply penalty to all scores
  Object.keys(adjusted).forEach(k => {
    adjusted[k] = clamp(adjusted[k] + attendancePenalty)
  })

  // ── Activity-based trend per category ────────────────────────────────────
  const categories = Object.keys(CATEGORY_TO_FIELD) as ActivityCategory[]

  for (const cat of categories) {
    const field = CATEGORY_TO_FIELD[cat]
    const catActivities = [...activities]
      .filter(a => a.category === cat)
      .sort((a, b) => a.date.localeCompare(b.date))

    if (catActivities.length < 4) {
      trends.push({ field, category: cat, trend: "no_data", delta: 0, recentAvg: null, prevAvg: null })
      continue
    }

    // Split into recent (last half) and previous (first half)
    const half = Math.floor(catActivities.length / 2)
    const prev   = catActivities.slice(0, half).map(a => a.value)
    const recent = catActivities.slice(-half).map(a => a.value)

    const prevAvg   = avg(prev)
    const recentAvg = avg(recent)

    // Determine improvement direction
    const lowerIsBetter = LOWER_IS_BETTER.includes(catActivities[catActivities.length - 1].unit as ActivityUnit)
    const rawDelta = recentAvg - prevAvg
    const improved = lowerIsBetter ? rawDelta < 0 : rawDelta > 0
    const pctChange = prevAvg !== 0 ? Math.abs(rawDelta / prevAvg) : 0

    let trend: TrendDirection = "stable"
    let scoreDelta = 0

    if (pctChange > 0.03) {             // >3% change to avoid noise
      if (improved) {
        trend = "up"
        scoreDelta = Math.min(1.5, pctChange * 5)   // cap at +1.5
      } else {
        trend = "down"
        scoreDelta = -Math.min(1.5, pctChange * 5)  // cap at –1.5
      }
    }

    adjusted[field] = clamp(adjusted[field] + scoreDelta)

    trends.push({
      field, category: cat, trend,
      delta: parseFloat(scoreDelta.toFixed(1)),
      recentAvg: parseFloat(recentAvg.toFixed(2)),
      prevAvg: parseFloat(prevAvg.toFixed(2)),
    })
  }

  const hasData = activities.length >= 4 || attendances.length >= 3

  return { scores: adjusted, trends, attendancePenalty, attendanceRate, hasData }
}
