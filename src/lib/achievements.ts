/**
 * Player achievements ("logros"), computed from data the academy already
 * records. Personal only — never a ranking between children.
 *
 * Deliberately left out: records from logged activities, because the app does
 * not store whether more or less is better for each exercise (a sprint time
 * improves by going down, a jump by going up). Evaluations are unambiguous.
 */

export interface AttendedSession { date: string; status: "present" | "absent" | "late" | "excused" | null }
export interface EvalPoint { date: string; general_score: number }
export interface InjuryPoint { date_return: string | null; is_recovered: boolean }

export type AchievementId = "streak" | "sessions" | "perfect_month" | "best_eval" | "comeback"

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  emoji: string
  earned: boolean
  /** How close a not-yet-earned achievement is, for "3 de 5". */
  progress?: { current: number; target: number }
}

const attended = (s: AttendedSession) => s.status === "present" || s.status === "late"

export const STREAK_TARGET = 5
export const SESSION_TIERS = [10, 25, 50, 100]
export const PERFECT_MONTH_MIN = 4

function daysBefore(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

export function computeAchievements(
  input: { sessions: AttendedSession[]; evaluations: EvalPoint[]; injuries: InjuryPoint[] },
  today: string,
): Achievement[] {
  // Only sessions that already happened and where attendance was taken.
  const marked = input.sessions
    .filter(s => s.date <= today && s.status !== null)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Current streak: consecutive attended sessions, counting back from the latest.
  // An excused absence neither breaks nor extends it.
  let streak = 0
  for (let i = marked.length - 1; i >= 0; i--) {
    const s = marked[i]
    if (s.status === "excused") continue
    if (!attended(s)) break
    streak++
  }

  const total = marked.filter(attended).length
  const tier = [...SESSION_TIERS].reverse().find(n => total >= n)
  const nextTier = SESSION_TIERS.find(n => total < n)

  const lastMonth = marked.filter(s => s.date > daysBefore(today, 30) && s.status !== "excused")
  const perfectMonth = lastMonth.length >= PERFECT_MONTH_MIN && lastMonth.every(attended)

  const evals = [...input.evaluations].sort((a, b) => a.date.localeCompare(b.date))
  const latest = evals[evals.length - 1]
  const bestBefore = evals.slice(0, -1).reduce((m, e) => Math.max(m, e.general_score), -Infinity)
  const bestEval = evals.length >= 2 && latest.general_score > bestBefore

  // Came back: a recovered injury, and attended a session on/after the return date.
  const comeback = input.injuries.some(inj =>
    inj.is_recovered && inj.date_return !== null &&
    marked.some(s => attended(s) && s.date >= inj.date_return!))

  return [
    {
      id: "streak", emoji: "🔥", title: `Racha de ${STREAK_TARGET} entrenamientos`,
      description: streak >= STREAK_TARGET ? `Lleva ${streak} entrenamientos seguidos sin faltar` : "Asistir a entrenamientos seguidos sin faltar",
      earned: streak >= STREAK_TARGET,
      progress: streak >= STREAK_TARGET ? undefined : { current: streak, target: STREAK_TARGET },
    },
    {
      id: "sessions", emoji: "🏅", title: tier ? `${tier} entrenamientos` : `${SESSION_TIERS[0]} entrenamientos`,
      description: tier ? `Ya suma ${total} entrenamientos en la academia` : "Entrenamientos a los que ha asistido",
      earned: !!tier,
      progress: nextTier ? { current: total, target: nextTier } : undefined,
    },
    {
      id: "perfect_month", emoji: "📅", title: "Mes perfecto",
      description: perfectMonth ? "No faltó a ningún entrenamiento en los últimos 30 días" : `Asistir a todo en 30 días (mínimo ${PERFECT_MONTH_MIN} entrenamientos)`,
      earned: perfectMonth,
    },
    {
      id: "best_eval", emoji: "⚡", title: "Su mejor evaluación",
      description: bestEval ? `Superó su mejor puntaje con ${latest.general_score} puntos` : "Superar su mejor puntaje general",
      earned: bestEval,
    },
    {
      id: "comeback", emoji: "💪", title: "Volvió tras su lesión",
      description: "Se recuperó y volvió a entrenar",
      earned: comeback,
    },
  ]
}
